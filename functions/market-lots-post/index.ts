import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type' }
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
  const { seller_id, seller_name, plate_json, price } = await req.json()
  if (!seller_id || !plate_json || !price) return new Response(JSON.stringify({ error: 'seller_id, plate_json, price required' }), { status: 400, headers: cors })
  await supabase.from('market_lots').insert({ seller_id, seller_name, plate_json, price, status: 'active' })
  return new Response(JSON.stringify({ ok: true }), { headers: cors })
})
