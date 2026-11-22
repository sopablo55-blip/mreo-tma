import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  )
  const { plateId, userId } = await req.json()
  const { data: plate } = await supabase.from('plates').select('value, owner_id').eq('id', plateId).single()
  if (!plate || plate.owner_id !== userId) {
    return new Response(JSON.stringify({ error: 'Номер не найден' }), { status: 400, headers: corsHeaders })
  }
  const { data: profile } = await supabase.from('profiles').select('balance').eq('telegram_id', userId).single()
  const gain = Math.round(plate.value * 0.65)
  const newBalance = (profile?.balance || 0) + gain
  await supabase.from('profiles').update({ balance: newBalance }).eq('telegram_id', userId)
  await supabase.from('plates').update({ in_garage: false }).eq('id', plateId)
  return new Response(JSON.stringify({ gain, newBalance }), { headers: corsHeaders })
})
