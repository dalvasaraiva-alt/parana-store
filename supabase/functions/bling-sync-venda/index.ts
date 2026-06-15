import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const body = await req.json()
    const venda = body.venda || body
    console.log('INICIO - venda:', JSON.stringify(venda))
    const { data: tokenData } = await supabase.from('bling_tokens').select('*').eq('id', 1).single()
    if (!tokenData) return new Response(JSON.stringify({ error: 'Bling nao conectado' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    const token = tokenData.access_token
    const nome = venda?.cliente_nome || venda?.customer_name || 'Cliente Teste'
    const produto = venda?.produto || venda?.product_name || 'Produto'
    const quantidade = Number(venda?.quantidade || 1)
    const valorTotal = Number(venda?.valor_total || venda?.total_price || 10)
    const valorUnit = Number(venda?.valor_unitario || venda?.unit_price || valorTotal)
    console.log('Buscando contato:', nome)
    await sleep(300)
    const r1 = await fetch('https://www.bling.com.br/Api/v3/contatos?pesquisa=' + encodeURIComponent(nome), { headers: { 'Authorization': 'Bearer ' + token } })
    const d1 = await r1.json()
    console.log('Busca contato resultado:', JSON.stringify(d1))
    let contatoId = d1?.data?.[0]?.id || null
    if (!contatoId) {
      await sleep(400)
      console.log('Criando contato...')
      const r2 = await fetch('https://www.bling.com.br/Api/v3/contatos', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify({ nome: nome, tipo: 'F', situacao: 'A' }) })
      const d2 = await r2.json()
      console.log('Contato criado:', JSON.stringify(d2))
      contatoId = d2?.data?.id || null
    }
    if (!contatoId) return new Response(JSON.stringify({ error: 'Nao foi possivel criar contato no Bling' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    await sleep(400)
    console.log('Buscando formas de pagamento...')
    const r3 = await fetch('https://www.bling.com.br/Api/v3/formas-pagamentos', { headers: { 'Authorization': 'Bearer ' + token } })
    const d3 = await r3.json()
    console.log('Formas pag:', JSON.stringify(d3?.data))
    const formaPagId = d3?.data?.[0]?.id || 1
    await sleep(400)
    const hoje = new Date().toISOString().split('T')[0]
    const payload = { data: hoje, contato: { id: contatoId }, itens: [{ descricao: produto, quantidade: quantidade, valor: valorUnit }], parcelas: [{ dataVencimento: hoje, valor: valorTotal, formaPagamento: { id: formaPagId } }] }
    console.log('Criando pedido:', JSON.stringify(payload))
    const r4 = await fetch('https://www.bling.com.br/Api/v3/pedidos/vendas', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify(payload) })
    const d4 = await r4.json()
    console.log('Pedido resultado:', JSON.stringify(d4))
    if (!r4.ok) return new Response(JSON.stringify({ error: 'Erro no Bling', details: d4 }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    if (venda?.id) await supabase.from('sales').update({ bling_id: d4.data?.id, bling_numero: d4.data?.numero, sincronizado_bling: true, sincronizado_em: new Date().toISOString() }).eq('id', venda.id)
    return new Response(JSON.stringify({ success: true, bling_numero: d4.data?.numero }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('ERRO GERAL:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})



