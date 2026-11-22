import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type' }
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
  const { caseId, userId } = await req.json()
  const priceMap: Record<string, number> = { c1: 50000, c2: 250000, c3: 1000000, c4: 5000000 }
  const price = priceMap[caseId] || 0
  if (!price) return new Response(JSON.stringify({ error: 'Кейс не найден' }), { status: 400, headers: cors })
  const { data: profile } = await supabase.from('profiles').select('balance').eq('telegram_id', userId).single()
  if ((profile?.balance || 0) < price) return new Response(JSON.stringify({ error: 'Не хватает денег' }), { status: 400, headers: cors })
  await supabase.from('profiles').update({ balance: (profile.balance || 0) - price }).eq('telegram_id', userId)
  const r = Math.random()
  let win = 0, msg = ''
  if (caseId === 'c1') { if (r < 0.45) win = (Math.floor(Math.random()*4)+2)*5000; else if (r < 0.80) win = 15000; else win = 0 }
  if (caseId === 'c2') { if (r < 0.40) win = (Math.floor(Math.random()*3)+2)*40000; else if (r < 0.98) win = 55000; else win = 150000 }
  if (caseId === 'c3') { if (r < 0.45) win = (Math.floor(Math.random()*3)+3)*100000; else if (r < 0.98) win = 390000; else win = 1000000 }
  if (caseId === 'c4') { if (r < 0.45) win = (Math.floor(Math.random()*3)+4)*400000; else if (r < 0.97) win = 1400000; else win = 5000000 }
  if (win > 0) await supabase.from('profiles').update({ balance: (profile.balance || 0) - price + win }).eq('telegram_id', userId)
  return new Response(JSON.stringify({ win, price }), { headers: cors })
})
