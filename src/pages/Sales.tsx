// Enviar para o Bling
try {
  const blingItems = saleProducts.map(sp => ({
    produto: {
      id: (sp.product as any)?.bling_id || 0,
      codigo: (sp.product as any)?.model || '',
      descricao: `${(sp.product as any)?.model || ''} ${(sp.product as any)?.color || ''}`.trim(),
      unidade: 'UN',
    },
    quantidade: sp.quantity,
    valor: sp.unit_price,
  }));

  const blingPayload = {
    numeroPedido: saleData.id.slice(0, 8),
    data: saleDate,
    contato: {
      nome: formData.customer_name,
      cpfCnpj: formData.customer_cpf ? cleanCpf(formData.customer_cpf) : '',
      telefone: formData.customer_phone || '',
    },
    itens: blingItems,
    total: totals.totalSalePrice,
    observacoes: formData.delivery_notes || '',
  };

  await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bling-sync`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'create_order', order: blingPayload }),
  });
} catch (blingErr) {
  console.error('Erro ao enviar para Bling:', blingErr);
}

alert('Venda registrada com sucesso!');