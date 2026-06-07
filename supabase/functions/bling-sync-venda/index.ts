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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const BLING_CLIENT_ID = Deno.env.get('BLING_CLIENT_ID')
    const BLING_CLIENT_SECRET = Deno.env.get('BLING_CLIENT_SECRET')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { venda } = await req.json()
    const { data: tokenData } = await supabase.from('bling_tokens').select('*').eq('id', 1).single()
    if (!tokenData) {
      return new Response(JSON.stringify({ error: 'Bling nao conectado' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const payload = {
      data: new Date().toISOString().split('T')[0],
      contato: { nome: venda.cliente_nome || 'Cliente', cpfCnpj: venda.cliente_cpf || '', email: venda.cliente_email || '' },
      itens: [{ descricao: venda.produto || 'Produto', quantidade: venda.quantidade || 1, valor: venda.valor_unitario || venda.valor_total }],
      parcelas: [{ dataVencimento: new Date().toISOString().split('T')[0], valor: venda.valor_total, formaPagamento: { id: 17 } }]
    }
    const blingResponse = await fetch('https://www.bling.com.br/Api/v3/pedidos/vendas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tokenData.access_token },
      body: JSON.stringify(payload)
    })
    const blingData = await blingResponse.json()
    if (!blingResponse.ok) {
      return new Response(JSON.stringify({ error: 'Erro no Bling', details: blingData }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    if (venda.id) {
      await supabase.from('sales').update({ bling_id: blingData.data?.id, bling_numero: blingData.data?.numero, sincronizado_bling: true, sincronizado_em: new Date().toISOString() }).eq('id', venda.id)
    }
    return new Response(JSON.stringify({ success: true, bling_numero: blingData.data?.numero }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
