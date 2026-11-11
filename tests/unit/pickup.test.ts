import { describe, expect, it } from 'vitest';

import { buildPickupRows } from '@/utils/pickup';

describe('pickup utils', () => {
  it('sorts rows by total and skips empty states', () => {
    const rows = buildPickupRows(
      { TX: 24, CA: 65, AZ: 24, NV: 0 },
      { TX: 'Texas', CA: 'California', AZ: 'Arizona' },
    );

    expect(rows.map((row) => row.code)).toEqual(['CA', 'AZ', 'TX']);
    expect(rows[0]).toEqual({ code: 'CA', name: 'California', total: 65 });
  });
});
