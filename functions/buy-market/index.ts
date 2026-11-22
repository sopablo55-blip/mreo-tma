import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type' }
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
  const { lotId, userId } = await req.json()
  const { data: lot } = await supabase.from('market_lots').select('price,status,seller_id').eq('id', lotId).single()
  if (!lot || lot.status !== 'active') return new Response(JSON.stringify({ error: 'Лот недоступен' }), { status: 400, headers: cors })
  const { data: buyer } = await supabase.from('profiles').select('balance').eq('telegram_id', userId).single()
  if ((buyer?.balance || 0) < lot.price) return new Response(JSON.stringify({ error: 'Не хватает денег' }), { status: 400, headers: cors })
  const { data: seller } = await supabase.from('profiles').select('balance').eq('telegram_id', lot.seller_id).single()
  const commission = Math.round(lot.price * 0.07)
  await supabase.from('profiles').update({ balance: (buyer.balance || 0) - lot.price }).eq('telegram_id', userId)
  await supabase.from('profiles').update({ balance: (seller?.balance || 0) + lot.price - commission }).eq('telegram_id', lot.seller_id)
  await supabase.from('market_lots').update({ status: 'sold' }).eq('id', lotId)
  return new Response(JSON.stringify({ success: true, commission }), { headers: cors })
})
