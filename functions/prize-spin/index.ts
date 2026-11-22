import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type' }
const PRIZES = [{label:'1 000 ₽',weight:28,cash:1000},{label:'Блат',weight:1.5,type:'blat'},{label:'5 000 ₽',weight:20,cash:5000},{label:'Штраф',weight:18,cash:0},{label:'15 000 ₽',weight:9,cash:15000},{label:'Редкий номер',weight:6,type:'rare'},{label:'Бесплатный талон',weight:13.5,type:'free'},{label:'50 000 ₽',weight:4,cash:50000}]
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
  const { userId } = await req.json()
  if (!userId) return new Response(JSON.stringify({ error: 'userId required' }), { status: 400, headers: cors })
  const { data: profile } = await supabase.from('profiles').select('balance, spinDay').eq('telegram_id', userId).single()
  const today = new Date().toLocaleDateString('en-CA')
  const free = profile?.spinDay !== today
  if (!free && (profile?.balance || 0) < 10000) return new Response(JSON.stringify({ error: 'Не хватает 10 000 ₽' }), { status: 400, headers: cors })
  let newBalance = profile?.balance || 0
  if (!free) newBalance -= 10000
  const pick = PRIZES[Math.floor(Math.random() * PRIZES.length)] // placeholder; real weighted logic could go here
  await supabase.from('profiles').update({ balance: newBalance, spinDay: today }).eq('telegram_id', userId)
  return new Response(JSON.stringify({ win: pick.label, newBalance, free }), { headers: cors })
})
