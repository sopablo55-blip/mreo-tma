-- МРЭО: миграция для Telegram Mini App + Supabase
-- Выполни в Supabase Dashboard -> SQL Editor.
-- Существующие таблицы не удаляются.

alter table public.profiles
  add column if not exists game_state jsonb not null default '{}'::jsonb;

alter table public.plates
  add column if not exists client_key text;

create unique index if not exists plates_owner_client_key_uidx
  on public.plates(owner_id, client_key)
  where client_key is not null;

create index if not exists plates_owner_id_idx on public.plates(owner_id);
create index if not exists market_lots_status_created_idx
  on public.market_lots(status, created_at desc);

-- Клиент напрямую к таблицам не обращается.
-- Все операции идут через Edge Function, которая проверяет Telegram initData
-- и использует серверный service-role ключ. RLS оставляем включённым.
alter table public.profiles enable row level security;
alter table public.plates enable row level security;
alter table public.market_lots enable row level security;

-- Удаляем старые политики, ошибочно сравнивающие auth.uid() с Telegram ID.
drop policy if exists "users own profiles" on public.profiles;
drop policy if exists "profiles own plates" on public.plates;
drop policy if exists "plates own market_lots" on public.market_lots;

-- Не создаём публичных политик. Service role Edge Function обходит RLS.


-- Безопасное начисление продавцу. Вызывается только Edge Function с service_role.
create or replace function public.mreo_transfer_market_sale(
  p_seller_id bigint,
  p_price bigint
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_price < 1 then raise exception 'Invalid price'; end if;
  update public.profiles
     set balance = coalesce(balance, 0) + p_price
   where telegram_id = p_seller_id;
  if not found then raise exception 'Seller profile not found'; end if;
end;
$$;

revoke all on function public.mreo_transfer_market_sale(bigint,bigint) from public, anon, authenticated;
grant execute on function public.mreo_transfer_market_sale(bigint,bigint) to service_role;

-- Атомарные операции общего рынка. Все три RPC доступны только service_role.
create or replace function public.mreo_market_list(
  p_owner_id bigint,
  p_client_key text,
  p_price bigint
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plate public.plates%rowtype;
  v_lot public.market_lots%rowtype;
begin
  if p_price < 1000 or p_price > 1000000000 then
    raise exception 'Некорректная цена';
  end if;
  select * into v_plate from public.plates
   where owner_id = p_owner_id and client_key = p_client_key and in_garage = true
   for update;
  if not found then raise exception 'Номер не найден в гараже'; end if;
  if exists (select 1 from public.market_lots where plate_id = v_plate.id and status = 'active') then
    raise exception 'Номер уже выставлен';
  end if;
  insert into public.market_lots(seller_id, plate_id, price, status)
   values (p_owner_id, v_plate.id, p_price, 'active') returning * into v_lot;
  update public.plates set in_garage = false, listed_price = p_price, _published = true
   where id = v_plate.id;
  return jsonb_build_object('id', v_lot.id, 'price', v_lot.price, 'plate_id', v_lot.plate_id);
end;
$$;

create or replace function public.mreo_market_cancel(
  p_owner_id bigint,
  p_lot_id bigint
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lot public.market_lots%rowtype;
begin
  select * into v_lot from public.market_lots
   where id = p_lot_id and seller_id = p_owner_id and status = 'active'
   for update;
  if not found then raise exception 'Объявление не найдено или уже закрыто'; end if;
  update public.market_lots set status = 'cancelled' where id = v_lot.id;
  update public.plates set in_garage = true, listed_price = null, _published = false
   where id = v_lot.plate_id and owner_id = p_owner_id;
  return jsonb_build_object('ok', true, 'plate_id', v_lot.plate_id);
end;
$$;

create or replace function public.mreo_market_buy(
  p_buyer_id bigint,
  p_lot_id bigint
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lot public.market_lots%rowtype;
  v_buyer public.profiles%rowtype;
  v_seller public.profiles%rowtype;
  v_plate public.plates%rowtype;
  v_new_balance bigint;
begin
  select * into v_lot from public.market_lots
   where id = p_lot_id and status = 'active'
   for update;
  if not found then raise exception 'Лот уже недоступен'; end if;
  if v_lot.seller_id = p_buyer_id then raise exception 'Нельзя купить собственный номер'; end if;

  select * into v_buyer from public.profiles where telegram_id = p_buyer_id for update;
  if not found then raise exception 'Профиль покупателя не найден'; end if;
  select * into v_seller from public.profiles where telegram_id = v_lot.seller_id for update;
  if not found then raise exception 'Профиль продавца не найден'; end if;
  if coalesce(v_buyer.balance, 0) < v_lot.price then raise exception 'Недостаточно игровых рублей'; end if;

  select * into v_plate from public.plates where id = v_lot.plate_id and owner_id = v_lot.seller_id for update;
  if not found or v_plate.in_garage then raise exception 'Номер объявления недоступен'; end if;

  v_new_balance := coalesce(v_buyer.balance, 0) - v_lot.price;
  update public.profiles set balance = v_new_balance where telegram_id = p_buyer_id;
  update public.profiles set balance = coalesce(balance, 0) + v_lot.price where telegram_id = v_lot.seller_id;
  update public.plates set
    owner_id = p_buyer_id,
    client_key = coalesce(v_plate.client_key, v_plate.id::text) || '-b-' || replace(gen_random_uuid()::text, '-', ''),
    in_garage = true,
    listed_price = null,
    _published = false
   where id = v_plate.id;
  update public.market_lots set status = 'sold' where id = v_lot.id;

  return jsonb_build_object('ok', true, 'balance', v_new_balance, 'price', v_lot.price);
end;
$$;

revoke all on function public.mreo_market_list(bigint,text,bigint) from public, anon, authenticated;
revoke all on function public.mreo_market_cancel(bigint,bigint) from public, anon, authenticated;
revoke all on function public.mreo_market_buy(bigint,bigint) from public, anon, authenticated;
grant execute on function public.mreo_market_list(bigint,text,bigint) to service_role;
grant execute on function public.mreo_market_cancel(bigint,bigint) to service_role;
grant execute on function public.mreo_market_buy(bigint,bigint) to service_role;


-- Сохранение прогресса с балансом-дельтой: не затирает начисления от сделки,
-- если продавец оставался в игре открытым на другом устройстве.
create or replace function public.mreo_save_profile(
  p_user_id bigint,
  p_username text,
  p_balance_delta bigint,
  p_crystals bigint,
  p_refs integer,
  p_link_level integer,
  p_game_state jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance bigint;
begin
  update public.profiles set
    username = left(coalesce(p_username, 'Гражданин'), 64),
    balance = greatest(0, coalesce(balance, 0) + coalesce(p_balance_delta, 0)),
    crystals = greatest(0, coalesce(p_crystals, 0)),
    refs = greatest(0, coalesce(p_refs, 0)),
    link_level = greatest(0, least(4, coalesce(p_link_level, 0))),
    game_state = coalesce(p_game_state, '{}'::jsonb)
   where telegram_id = p_user_id
   returning balance into v_balance;
  if not found then raise exception 'Профиль не найден'; end if;
  return jsonb_build_object('balance', v_balance);
end;
$$;
revoke all on function public.mreo_save_profile(bigint,text,bigint,bigint,integer,integer,jsonb) from public, anon, authenticated;
grant execute on function public.mreo_save_profile(bigint,text,bigint,bigint,integer,integer,jsonb) to service_role;
