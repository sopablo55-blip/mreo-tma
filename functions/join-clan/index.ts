import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type' }
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
  const { clanId, userId } = await req.json()
  if (!clanId || !userId) return new Response(JSON.stringify({ error: 'clanId,userId required' }), { status: 400, headers: cors })
  const exists = await supabase.from('clan_members').select('id').eq('clan_id', clanId).eq('user_id', userId).single()
  if (exists?.data) return new Response(JSON.stringify({ error: 'Уже в клане' }), { status: 400, headers: cors })
  await supabase.from('clan_members').insert({ clan_id: clanId, user_id: userId, role: 'member' })
  return new Response(JSON.stringify({ ok: true }), { headers: cors })
})
