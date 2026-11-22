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

  const { userId } = await req.json()
  if (!userId) return new Response('userId required', { status: 400 })

  // Проверить баланс
  const { data: profile } = await supabase.from('profiles').select('balance, link_level').eq('telegram_id', userId).single()
  if (!profile || (profile.balance || 0) < 5000) {
    return new Response(JSON.stringify({ error: 'Не хватает денег' }), { status: 400, headers: corsHeaders })
  }

  // Сгенерировать номер
  const letters = 'АВЕКМНОРСТУХ'
  const regions = ['77','99','177','197','777','78','178','50','750','16','116','52','63','66','74','02','59','55','38','34','161','23','123','24','42','05','95']
  const f = letters[Math.floor(Math.random() * letters.length)]
  const d = String(1 + Math.floor(Math.random() * 999)).padStart(3, '0')
  const t = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)]
  const reg = regions[Math.floor(Math.random() * regions.length)]

  // VIP-шанс
  const luck = 1 + (profile.link_level || 0) * 0.45
  const isBlat = Math.random() < Math.min(0.035 * luck, 0.28)

  // Начислить
  const newBalance = profile.balance - 5000
  await supabase.from('profiles').update({ balance: newBalance }).eq('telegram_id', userId)

  const plate = { f, d, t, reg, isBlat }
  const { data: newPlate } = await supabase.from('plates').insert({
    owner_id: userId,
    full: `${f}${d}${t} ${reg}`,
    region: reg,
    series: '',
    rarity: isBlat ? 'epic' : 'common',
    value: isBlat ? 1500000 : 2200,
    in_garage: true
  }).select().single()

  return new Response(JSON.stringify({ plate: newPlate, newBalance }), { headers: corsHeaders })
})
