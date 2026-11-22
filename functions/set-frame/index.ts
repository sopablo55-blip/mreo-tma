import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type' }
const FRAMES = [{id:'',mult:1,price:0},{id:'chrome',mult:1.1,price:15000},{id:'carbon',mult:1.2,price:45000},{id:'gold',mult:1.3,price:150000},{id:'neon',mult:1.4,price:300000}]
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
  const { plateId, frameId, userId } = await req.json()
  if (!plateId || !frameId) return new Response(JSON.stringify({ error: 'plateId,frameId required' }), { status: 400, headers: cors })
  const { data: plate } = await supabase.from('plates').select('value, owner_id').eq('id', plateId).single()
  if (!plate || plate.owner_id !== userId) return new Response(JSON.stringify({ error: 'Номер не принадлежит игроку' }), { status: 400, headers: cors })
  const frame = FRAMES.find(f => f.id === frameId)
  if (!frame) return new Response(JSON.stringify({ error: 'Рамка не найдена' }), { status: 400, headers: cors })
  const { data: profile } = await supabase.from('profiles').select('balance').eq('telegram_id', userId).single()
  if ((profile?.balance || 0) < frame.price) return new Response(JSON.stringify({ error: 'Не хватает денег' }), { status: 400, headers: cors })
  await supabase.from('profiles').update({ balance: (profile.balance || 0) - frame.price }).eq('telegram_id', userId)
  await supabase.from('plates').update({ frame: frameId }).eq('id', plateId)
  return new Response(JSON.stringify({ mult: frame.mult, newValue: Math.round(plate.value * frame.mult) }), { headers: cors })
})
