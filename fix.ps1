$content = Get-Content src/pages/Sales.tsx -Raw
$old = "alert('Venda registrada com sucesso!');"
$new = "try { const blingItems = saleProducts.map(sp => ({ produto: { codigo: (sp.product as any)?.model || '', descricao: ((sp.product as any)?.model || '') + ' ' + ((sp.product as any)?.color || ''), unidade: 'UN' }, quantidade: sp.quantity, valor: sp.unit_price })); await fetch(import.meta.env.VITE_SUPABASE_URL + '/functions/v1/bling-sync', { method: 'POST', headers: { 'Authorization': 'Bearer ' + import.meta.env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create_order', order: { data: saleDate, contato: { nome: formData.customer_name }, itens: blingItems, total: totals.totalSalePrice } }) }); } catch (blingErr) { console.error('Bling:', blingErr); } alert('Venda registrada com sucesso!');"
$content = $content.Replace($old, $new)
Set-Content src/pages/Sales.tsx $content -Encoding UTF8
Write-Host "Linhas: $((Get-Content src/pages/Sales.tsx).Count)"
