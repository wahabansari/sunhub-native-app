import type { QueryClient } from '@tanstack/react-query';

function rowsOf(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (typeof data !== 'object' || data === null) return [];
  const record = data as { pages?: unknown; items?: unknown };
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(record.pages)) return record.pages.flatMap(rowsOf);
  return [];
}

/**
 * Finds an item that an earlier list or home section already loaded, so its detail screen can show
 * that summary immediately while the full record loads.
 */
export function findCachedItem<T extends { id: string }>(
  client: QueryClient,
  rootKeys: readonly (readonly string[])[],
  id: string,
  isItem: (value: unknown) => value is T,
): T | undefined {
  for (const queryKey of rootKeys) {
    for (const [, data] of client.getQueriesData({ queryKey })) {
      const found = rowsOf(data).find((row): row is T => isItem(row) && row.id === id);
      if (found) return found;
    }
  }
  return undefined;
}
