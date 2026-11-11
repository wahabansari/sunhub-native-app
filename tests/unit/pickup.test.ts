import { describe, expect, it } from 'vitest';

import { buildPickupRows, selectionTiers } from '@/utils/pickup';

describe('pickup utils', () => {
  it('marks the selected state and every other state with deals', () => {
    expect(selectionTiers({ CA: 65, TX: 24, NV: 0 }, 'TX')).toEqual({ CA: 'has', TX: 'hi' });
  });

  it('leaves states without deals unmarked and tolerates no selection', () => {
    expect(selectionTiers({ CA: 0 }, 'CA')).toEqual({});
    expect(selectionTiers({}, null)).toEqual({});
    expect(selectionTiers({ CA: 3 }, null)).toEqual({ CA: 'has' });
  });

  it('sorts rows by total and skips empty states', () => {
    const rows = buildPickupRows(
      { TX: 24, CA: 65, AZ: 24, NV: 0 },
      { TX: 'Texas', CA: 'California', AZ: 'Arizona' },
    );

    expect(rows.map((row) => row.code)).toEqual(['CA', 'AZ', 'TX']);
    expect(rows[0]).toEqual({ code: 'CA', name: 'California', total: 65 });
  });
});
