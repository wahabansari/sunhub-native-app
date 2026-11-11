export type PickupRow = { code: string; name: string; total: number };

export function buildPickupRows(
  totals: Record<string, number>,
  names: Record<string, string>,
): PickupRow[] {
  return Object.entries(totals)
    .filter(([, total]) => total > 0)
    .map(([code, total]) => ({ code, name: names[code] ?? code, total }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}
