import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const BLING_CLIENT_ID = Deno.env.get('BLING_CLIENT_ID')
    const BLING_CLIENT_SECRET = Deno.env.get('BLING_CLIENT_SECRET')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const { code } = await req.json()
    if (!code) {
      return new Response(JSON.stringify({ error: 'Codigo nao fornecido' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const credentials = btoa(BLING_CLIENT_ID + ':' + BLING_CLIENT_SECRET)
    const tokenResponse = await fetch('https://www.bling.com.br/Api/v3/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + credentials },
      body: new URLSearchParams({ grant_type: 'authorization_code', code: code, redirect_uri: 'https://parana-store.vercel.app/bling-auth.html' })
    })
    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok || !tokenData.access_token) {
      return new Response(JSON.stringify({ error: 'Falha ao obter token', details: tokenData }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    await supabase.from('bling_tokens').upsert({ id: 1, access_token: tokenData.access_token, refresh_token: tokenData.refresh_token, expires_at: expiresAt, updated_at: new Date().toISOString() })
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
