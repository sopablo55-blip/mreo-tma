import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type' }
const CARS: any[] = [ ["Daewoo Matiz",35000,1.02,"budget"],["Lada Granta",160000,1.06,"budget"],["Toyota Camry 2.5",4500000,1.41,"business"],["Maybach S680 с мигалкой",100000000,2.25,"premium"] ]
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
  const { userId, carIndex } = await req.json()
  const car = CARS[carIndex || 0]
  if (!car) return new Response(JSON.stringify({ error: 'Машина не найдена' }), { status: 400, headers: cors })
  const { data: profile } = await supabase.from('profiles').select('balance').eq('telegram_id', userId).single()
  if ((profile?.balance || 0) < car[1]) return new Response(JSON.stringify({ error: 'Не хватает денег' }), { status: 400, headers: cors })
  await supabase.from('profiles').update({ balance: (profile.balance || 0) - car[1] }).eq('telegram_id', userId)
  await supabase.from('cars').insert({ owner_id: userId, model: car[0], level: 1, income_per_hour: Math.round(car[1]*0.05) })
  return new Response(JSON.stringify({ car: car[0] }), { headers: cors })
})
