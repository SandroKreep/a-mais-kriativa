/**
 * Formata preço em KZA com separador de milhar por ponto (ex.: 1.549.000 KZA).
 */
export function formatPriceKZA(value) {
  const num = Math.round(Number(value) || 0);
  const str = Math.abs(num).toString();
  const withDots = str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const signed = num < 0 ? `-${withDots}` : withDots;
  return `${signed} KZA`;
}
