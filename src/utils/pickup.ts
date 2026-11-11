export type PickupTier = 'hi' | 'has';

export type PickupRow = { code: string; name: string; total: number };

/** States with deals are `has`; the selected one is `hi` so the map follows the state pills. */
export function selectionTiers(
  totals: Record<string, number>,
  selected: string | null,
): Record<string, PickupTier> {
  const tiers: Record<string, PickupTier> = {};

  for (const [code, total] of Object.entries(totals)) {
    if (total <= 0) continue;
    tiers[code] = code === selected ? 'hi' : 'has';
  }
  return tiers;
}

export function buildPickupRows(
  totals: Record<string, number>,
  names: Record<string, string>,
): PickupRow[] {
  return Object.entries(totals)
    .filter(([, total]) => total > 0)
    .map(([code, total]) => ({ code, name: names[code] ?? code, total }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}
