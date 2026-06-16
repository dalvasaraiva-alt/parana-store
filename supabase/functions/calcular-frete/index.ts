import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const TOKEN = Deno.env.get('MELHOR_ENVIO_TOKEN')
    const { cep_destino, peso, altura, largura, comprimento } = await req.json()
    const body = {
      from: { postal_code: '80010200' },
      to: { postal_code: cep_destino.replace(/\D/g, '') },
      package: { height: altura || 8, width: largura || 12, length: comprimento || 24, weight: peso || 0.4 },
      options: { receipt: false, own_hand: false },
      services: '1,2,17'
    }
    const response = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TOKEN, 'User-Agent': 'Parana Store ERP (emersonjuliao99@gmail.com)' },
      body: JSON.stringify(body)
    })
    const data = await response.json()
    console.log('Melhor Envio:', JSON.stringify(data))
    return new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Erro:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})


