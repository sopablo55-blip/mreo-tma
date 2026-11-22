import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type' }
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
  const { userId } = await req.json()
  if (!userId) return new Response(JSON.stringify({ error: 'userId required' }), { status: 400, headers: cors })
  const { data: profile } = await supabase.from('profiles').select('balance, pay').eq('telegram_id', userId).single()
  const todayStr = new Date().toLocaleDateString('en-CA')
  const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString('en-CA')
  const pay = profile?.pay || { last: '', streak: 0 }
  if (pay.last === todayStr) return new Response(JSON.stringify({ error: 'Уже получено сегодня' }), { status: 400, headers: cors })
  const streak = pay.last === yesterdayStr ? Math.min((pay.streak || 0) + 1, 7) : 1
  const amount = streak * 10000
  const newBalance = (profile?.balance || 0) + amount
  await supabase.from('profiles').update({ balance: newBalance, pay: { last: todayStr, streak } }).eq('telegram_id', userId)
  return new Response(JSON.stringify({ streak, amount, newBalance }), { headers: cors })
})
