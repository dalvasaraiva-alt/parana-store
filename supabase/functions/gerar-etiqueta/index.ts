import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const TOKEN = Deno.env.get('MELHOR_ENVIO_TOKEN')
    const { venda } = await req.json()
    const body = {
      service: venda.servico_id,
      agency: null,
      from: { name: 'Parana Store', phone: '41999999999', email: 'emersonjuliao99@gmail.com', document: '', address: 'Rua Joao Negrao', complement: 'Sala 1805', number: '731', district: 'Centro', city: 'Curitiba', state_abbr: 'PR', country_id: 'BR', postal_code: '80010200', note: '' },
      to: { name: venda.cliente_nome, phone: venda.cliente_telefone, email: venda.cliente_email, document: venda.cliente_cpf, address: venda.endereco_rua, complement: venda.endereco_complemento, number: venda.endereco_numero, district: venda.endereco_bairro, city: venda.endereco_cidade, state_abbr: venda.endereco_estado, country_id: 'BR', postal_code: venda.endereco_cep, note: '' },
      products: [{ name: venda.produto, quantity: venda.quantidade, unitary_value: venda.valor_unitario }],
      volumes: [{ height: 8, width: 12, length: 24, weight: 0.4 }],
      options: { insurance_value: venda.valor_total, receipt: false, own_hand: false, reverse: false, non_commercial: false, invoice: { key: '' }, platform: 'Parana Store ERP', tags: [{ tag: String(venda.venda_id), url: null }] }
    }
    const res = await fetch('https://melhorenvio.com.br/api/v2/me/cart', { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TOKEN, 'User-Agent': 'Parana Store ERP (emersonjuliao99@gmail.com)' }, body: JSON.stringify(body) })
    const data = await res.json()
    console.log('Cart:', JSON.stringify(data))
    return new Response(JSON.stringify(data), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})