import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { findCachedItem } from '@/utils/cached-items';

type Row = { id: string; name: string };
const isRow = (value: unknown): value is Row =>
  typeof value === 'object' && value !== null && 'name' in value;

describe('findCachedItem', () => {
  it('finds an item in an infinite list, a page object and a plain array', () => {
    const client = new QueryClient();
    client.setQueryData(['products', { q: 'a' }], {
      pages: [{ items: [{ id: 'p1', name: 'One' }] }, { items: [{ id: 'p2', name: 'Two' }] }],
    });
    client.setQueryData(['home', 'buy-direct'], [{ id: 'p3', name: 'Three' }]);
    client.setQueryData(['home', 'pickup-deals:CA'], { items: [{ id: 'p4', name: 'Four' }] });

    const roots = [['products'], ['home']] as const;

    expect(findCachedItem(client, roots, 'p2', isRow)?.name).toBe('Two');
    expect(findCachedItem(client, roots, 'p3', isRow)?.name).toBe('Three');
    expect(findCachedItem(client, roots, 'p4', isRow)?.name).toBe('Four');
  });

  it('returns undefined for unknown ids, other roots and rows failing the guard', () => {
    const client = new QueryClient();
    client.setQueryData(['listings', 'x'], [{ id: 'd1', name: 'Deal' }]);
    client.setQueryData(['products', 'detail'], { id: 'p9', name: 'Detail record' });
    client.setQueryData(['products', 'odd'], [{ id: 'p8' }]);

    expect(findCachedItem(client, [['products']], 'd1', isRow)).toBeUndefined();
    expect(findCachedItem(client, [['listings']], 'nope', isRow)).toBeUndefined();
    expect(findCachedItem(client, [['products']], 'p9', isRow)).toBeUndefined();
    expect(findCachedItem(client, [['products']], 'p8', isRow)).toBeUndefined();
  });
});
