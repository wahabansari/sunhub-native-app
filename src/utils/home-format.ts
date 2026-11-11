const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  ndash: '–',
  mdash: '—',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
};

export function decodeHtmlEntities(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? match)
    .trim();
}

export function formatPerWatt(value: number, digits = 3): string {
  return Number.isFinite(value) ? `$${value.toFixed(digits)}` : '';
}

type PricedDeal = { pricePerWatt: number; perWatt: boolean };

export function dealPrice(deal: PricedDeal, digits = 3) {
  return deal.perWatt
    ? { amount: formatPerWatt(deal.pricePerWatt, digits), short: '/W', long: 'per watt' }
    : { amount: formatMoney(deal.pricePerWatt), short: '', long: 'per unit' };
}

export function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return '';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function wattageOf(source: { wattage?: string; name: string }): string | null {
  const fromField = source.wattage?.match(/\d{2,4}/)?.[0];
  if (fromField) return fromField;
  return source.name.match(/(\d{2,4})\s?W\b/i)?.[1] ?? null;
}

export function moqLabel(moq?: string, unit?: string): string {
  const amount = moq?.trim() || '1';
  if (/[a-z]/i.test(amount)) return amount;
  const label = unit?.trim() || 'pallets';
  return `${amount} ${amount === '1' ? label.replace(/s$/i, '') : label}`;
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export function listingLabel(listingType: unknown): string | undefined {
  if (typeof listingType !== 'string' || !listingType.trim()) return undefined;
  const singular = listingType.trim().replace(/s$/i, '');
  return singular.charAt(0).toUpperCase() + singular.slice(1).toLowerCase();
}
