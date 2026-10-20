export function formatCents(cents: number, currency: string = 'USD'): string {
  const symbol = currency === 'EUR' ? '€' : currency === 'JPY' ? '¥' : currency === 'GBP' ? '£' : '$';
  return `${symbol}${(Math.abs(cents) / 100).toFixed(2)}`;
}
