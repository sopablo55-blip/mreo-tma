import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function hex(bytes: Uint8Array) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(keyBytes: Uint8Array, message: string) {
  const key = await crypto.subtle.importKey(
    "raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
}

async function verifyTelegram(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) throw new Error("Telegram initData не содержит hash");

  const authDate = Number(params.get("auth_date") || 0);
  const now = Math.floor(Date.now() / 1000);
  if (!authDate || authDate > now + 30 || now - authDate > 86400) {
    throw new Error("Срок действия Telegram initData истёк. Перезапусти Mini App.");
  }

  params.delete("hash");
  params.delete("signature");
  const check = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secret = await hmac(new TextEncoder().encode("WebAppData"), botToken);
  const calculated = hex(await hmac(secret, check));
  if (!/^[0-9a-f]{64}$/i.test(hash) || calculated.length !== hash.length) {
    throw new Error("Неверная подпись Telegram");
  }
  const a = new TextEncoder().encode(calculated.toLowerCase());
  const b = new TextEncoder().encode(hash.toLowerCase());
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  if (diff !== 0) throw new Error("Неверная подпись Telegram");

  const userRaw = params.get("user");
  if (!userRaw) throw new Error("В Telegram initData нет пользователя");
  const user = JSON.parse(userRaw);
  if (!user?.id || !Number.isSafeInteger(Number(user.id))) throw new Error("Некорректный Telegram user ID");
  return { id: String(user.id), username: String(user.username || user.first_name || "Гражданин").slice(0, 64) };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "Используй POST" }, 405);

  try {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!botToken || !supabaseUrl || !serviceKey) throw new Error("Не настроены секреты Edge Function");

    const body = await req.json();
    const user = await verifyTelegram(String(body.initData || ""), botToken);
    const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const action = String(body.action || "load");
    const profileBase = { telegram_id: user.id, username: user.username };

    if (action === "load") {
      const { data: profile, error: profileError } = await db
        .from("profiles").upsert(profileBase, { onConflict: "telegram_id", ignoreDuplicates: false })
        .select("*").single();
      if (profileError) throw profileError;

      const { data: plates, error: platesError } = await db.from("plates")
        .select("id,client_key,full,region,series,rarity,value,listed_price,in_garage")
        .eq("owner_id", user.id).eq("in_garage", true);
      if (platesError) throw platesError;

      const lotSelect = "id,seller_id,plate_id,price,status,created_at,plates(id,client_key,full,region,series,rarity,value)";
      const { data: lotsRaw, error: lotsError } = await db.from("market_lots")
        .select(lotSelect).eq("status", "active")
        .order("created_at", { ascending: false }).limit(100);
      if (lotsError) throw lotsError;
      const { data: ownLotsRaw, error: ownLotsError } = await db.from("market_lots")
        .select(lotSelect).eq("status", "active").eq("seller_id", user.id)
        .order("created_at", { ascending: false }).limit(250);
      if (ownLotsError) throw ownLotsError;

      const sellerIds = [...new Set([...(lotsRaw || []), ...(ownLotsRaw || [])].map((l: any) => String(l.seller_id)))];
      const { data: sellers, error: sellersError } = sellerIds.length
        ? await db.from("profiles").select("telegram_id,username").in("telegram_id", sellerIds)
        : { data: [], error: null };
      if (sellersError) throw sellersError;
      const sellerNames = new Map((sellers || []).map((p: any) => [String(p.telegram_id), p.username]));
      const decorate = (l: any) => ({ ...l, seller_name: sellerNames.get(String(l.seller_id)) || "Игрок" });
      const lots = (lotsRaw || []).map(decorate);
      const myLots = (ownLotsRaw || []).map(decorate);

      return json({
        ok: true,
        userId: user.id,
        profile,
        plates: plates || [],
        hasCloudPlates: Boolean(plates?.length),
        hasCloudState: Object.keys(profile.game_state || {}).length > 0,
        lots,
        myLots,
      });
    }

    if (action === "save") {
      const state = body.state;
      if (!state || typeof state !== "object" || Array.isArray(state)) throw new Error("Нет игрового состояния");
      const safeState = structuredClone(state);
      delete safeState.lots;
      delete safeState.plates;
      const desiredBalance = Math.max(0, Math.floor(Number(state.rub) || 0));
      const baseBalance = Math.max(0, Math.floor(Number(body.baseBalance) || 0));
      const { data: savedProfile, error: profileError } = await db.rpc("mreo_save_profile", {
        p_user_id: user.id,
        p_username: user.username,
        p_balance_delta: desiredBalance - baseBalance,
        p_crystals: Math.max(0, Math.floor(Number(state.crystals) || 0)),
        p_refs: Math.max(0, Math.floor(Number(state.refs) || 0)),
        p_link_level: Math.max(0, Math.min(4, Math.floor(Number(state.linkLvl) || 0))),
        p_game_state: safeState,
      });
      if (profileError) throw profileError;

      const incoming = Array.isArray(state.plates) ? state.plates : [];
      const rows = incoming.map((p: any) => ({
        owner_id: user.id,
        client_key: String(p.id),
        full: `${String(p.f || "").slice(0, 1)}${String(p.d || "").slice(0, 3)}${String(p.t || "").slice(0, 2)}`,
        region: String(p.reg || "").slice(0, 8),
        series: String(p.ser || "").slice(0, 16),
        rarity: String(p.rar || "common").slice(0, 16),
        value: Math.max(0, Math.floor(Number(p.val) || 0)),
        in_garage: true,
        listed_price: null,
        _published: false,
      }));
      if (rows.length) {
        const { error: upsertError } = await db.from("plates").upsert(rows, { onConflict: "owner_id,client_key" });
        if (upsertError) throw upsertError;
      }
      return json({ ok: true, balance: Number(savedProfile?.balance ?? desiredBalance) });
    }

    if (action === "list") {
      const clientKey = String(body.plateId || "");
      const price = Math.floor(Number(body.price));
      if (!clientKey || !Number.isSafeInteger(price) || price < 1000 || price > 1_000_000_000) {
        throw new Error("Укажи корректную цену от 1 000 до 1 млрд ₽");
      }
      const { data, error } = await db.rpc("mreo_market_list", {
        p_owner_id: user.id, p_client_key: clientKey, p_price: price,
      });
      if (error) throw error;
      return json({ ok: true, lot: data });
    }

    if (action === "cancel") {
      const lotId = Number(body.lotId);
      if (!Number.isSafeInteger(lotId) || lotId < 1) throw new Error("Некорректный ID объявления");
      const { data, error } = await db.rpc("mreo_market_cancel", { p_owner_id: user.id, p_lot_id: lotId });
      if (error) throw error;
      return json({ ok: true, result: data });
    }

    if (action === "buy") {
      const lotId = Number(body.lotId);
      if (!Number.isSafeInteger(lotId) || lotId < 1) throw new Error("Некорректный ID объявления");
      const { data, error } = await db.rpc("mreo_market_buy", { p_buyer_id: user.id, p_lot_id: lotId });
      if (error) throw error;
      return json({ ok: true, result: data });
    }

    if (action === "top") {
      const { data: profiles, error: profilesError } = await db.from("profiles")
        .select("telegram_id,username,balance").order("balance", { ascending: false }).limit(1000);
      if (profilesError) throw profilesError;
      const ids = (profiles || []).map((p: any) => String(p.telegram_id));
      const { data: owned, error: ownedError } = ids.length
        ? await db.from("plates").select("owner_id,value").in("owner_id", ids)
        : { data: [], error: null };
      if (ownedError) throw ownedError;
      const plateTotals = new Map<string, number>();
      for (const p of owned || []) plateTotals.set(String(p.owner_id), (plateTotals.get(String(p.owner_id)) || 0) + Number(p.value || 0));
      const players = (profiles || []).map((p: any) => ({
        id: String(p.telegram_id),
        name: String(p.username || "Гражданин"),
        worth: Number(p.balance || 0) + (plateTotals.get(String(p.telegram_id)) || 0),
      })).sort((a: any, b: any) => b.worth - a.worth).slice(0, 100);
      return json({ ok: true, players });
    }

    throw new Error("Неизвестное действие");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка сервера";
    console.error("mreo-api:", message);
    return json({ ok: false, error: message }, 400);
  }
});
