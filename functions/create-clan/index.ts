import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type' }
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
  const { name, tag, userId } = await req.json()
  if (!name || !tag || !userId) return new Response(JSON.stringify({ error: 'name,tag,userId required' }), { status: 400, headers: cors })
  const { data: clan } = await supabase.from('clans').insert({ name, tag, owner_id: userId }).select().single()
  await supabase.from('clan_members').insert({ clan_id: clan.id, user_id: userId, role: 'owner' })
  return new Response(JSON.stringify({ clan }), { headers: cors })
})
