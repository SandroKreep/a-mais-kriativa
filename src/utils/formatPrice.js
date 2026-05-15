/**
 * Remove pontos (separadores de milhar) e converte para número.
 * Aceita tanto 12.000 como 12000 e trata ambos como doze mil.
 */
export function parsePreco(valor) {
  if (typeof valor === 'number') return valor;
  if (!valor) return 0;
  // Remove pontos (separadores de milhar) e substitui vírgula por ponto decimal
  const cleaned = String(valor).replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

/**
 * Formata preço em KZA com separador de milhar por ponto (ex.: 1.549.000 KZA).
 */
export function formatPriceKZA(value) {
  const num = Math.round(parsePreco(value) || 0);
  return num.toLocaleString('pt-AO') + ' KZA';
}
