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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { venda } = await req.json()
    console.log('Venda recebida:', JSON.stringify(venda))
    const { data: tokenData } = await supabase.from('bling_tokens').select('*').eq('id', 1).single()
    if (!tokenData) {
      return new Response(JSON.stringify({ error: 'Bling nao conectado' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const nome = venda?.cliente_nome || venda?.customer_name || 'Cliente'
    const produto = venda?.produto || venda?.product_name || 'Produto'
    const quantidade = Number(venda?.quantidade || venda?.quantity || 1)
    const valorTotal = Number(venda?.valor_total || venda?.total_price || 0)
    const valorUnitario = Number(venda?.valor_unitario || venda?.unit_price || valorTotal)
    const formasPagamento: Record<string, number> = { 'pix': 1, 'dinheiro': 1, 'cartao_credito': 1, 'cartao_debito': 1, 'boleto': 1 }
    const accessToken = tokenData.access_token
    let contatoId = null
    const searchResp = await fetch('https://www.bling.com.br/Api/v3/contatos?pesquisa=' + encodeURIComponent(nome), {
      headers: { 'Authorization': 'Bearer ' + accessToken }
    })
    const searchData = await searchResp.json()
    console.log('Busca contato:', JSON.stringify(searchData))
    if (searchData?.data?.length > 0) {
      contatoId = searchData.data[0].id
    } else {
      const createContact = await fetch('https://www.bling.com.br/Api/v3/contatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + accessToken },
        body: JSON.stringify({ nome: nome, tipo: 'F' })
      })
      const contactData = await createContact.json()
      console.log('Contato criado:', JSON.stringify(contactData))
      contatoId = contactData?.data?.id
    }
    const formasPagBling = await fetch('https://www.bling.com.br/Api/v3/formas-pagamentos', {
      headers: { 'Authorization': 'Bearer ' + accessToken }
    })
    const formasPagData = await formasPagBling.json()
    console.log('Formas pagamento:', JSON.stringify(formasPagData?.data?.slice(0,3)))
    const formaPagId = formasPagData?.data?.[0]?.id || 1
    const payload = {
      data: new Date().toISOString().split('T')[0],
      contato: { id: contatoId },
      itens: [{ descricao: produto, quantidade: quantidade, valor: valorUnitario }],
      parcelas: [{ dataVencimento: new Date().toISOString().split('T')[0], valor: valorTotal, formaPagamento: { id: formaPagId } }]
    }
    console.log('Payload:', JSON.stringify(payload))
    const blingResponse = await fetch('https://www.bling.com.br/Api/v3/pedidos/vendas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + accessToken },
      body: JSON.stringify(payload)
    })
    const blingData = await blingResponse.json()
    console.log('Resposta Bling:', JSON.stringify(blingData))
    if (!blingResponse.ok) {
      return new Response(JSON.stringify({ error: 'Erro no Bling', details: blingData }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    if (venda.id) {
      await supabase.from('sales').update({ bling_id: blingData.data?.id, bling_numero: blingData.data?.numero, sincronizado_bling: true, sincronizado_em: new Date().toISOString() }).eq('id', venda.id)
    }
    return new Response(JSON.stringify({ success: true, bling_numero: blingData.data?.numero }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Erro geral:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
