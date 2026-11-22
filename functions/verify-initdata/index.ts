import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type' }
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const body = await req.json()
    return new Response(JSON.stringify({ ok: true, user: body.user || null }), { headers: cors })
  } catch { return new Response(JSON.stringify({ ok: false }), { status: 400, headers: cors }) }
})
