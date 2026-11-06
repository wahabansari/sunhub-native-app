import {
  getDealDisplayPrices,
  getDealMsrpDiscountPercent,
  shouldShowDealMsrpDiscount,
} from '@/utils/pricing';

const NOW = new Date(2026, 10, 6);

describe('deal pricing', () => {
  it('shows a discount when no promotion window is set', () => {
    expect(getDealDisplayPrices({ sunhub_price: 80, msrp: 100 }, NOW)).toEqual({
      sellingPrice: 80,
      strikeThroughPrice: 100,
      showDiscount: true,
    });
  });

  it('shows a discount inside an active window', () => {
    expect(
      getDealDisplayPrices(
        {
          seller_price: 75,
          msrp: 100,
          start_date: '2026-10-01',
          end_date: '2026-11-10',
        },
        NOW,
      ),
    ).toEqual({ sellingPrice: 75, strikeThroughPrice: 100, showDiscount: true });
  });

  it('uses MSRP after the window expires', () => {
    expect(getDealDisplayPrices({ price: 70, msrp: 100, endDate: '2026-11-01' }, NOW)).toEqual({
      sellingPrice: 100,
      strikeThroughPrice: null,
      showDiscount: false,
    });
  });

  it('does not show a future discount yet', () => {
    expect(getDealDisplayPrices({ price: 70, msrp: 100, startDate: '2026-12-01' }, NOW)).toEqual({
      sellingPrice: 70,
      strikeThroughPrice: null,
      showDiscount: false,
    });
  });

  it('handles missing or invalid values', () => {
    expect(getDealDisplayPrices(null, NOW)).toEqual({
      sellingPrice: null,
      strikeThroughPrice: null,
      showDiscount: false,
    });
    expect(getDealDisplayPrices({ price: 'nope', msrp: '' }, NOW)).toEqual({
      sellingPrice: null,
      strikeThroughPrice: null,
      showDiscount: false,
    });
  });

  it('calculates the discount percent and hides it for pending deals', () => {
    const deal = { sunhub_price: 80, msrp: 100 };
    expect(getDealMsrpDiscountPercent(deal)).toBeCloseTo(20);
    expect(shouldShowDealMsrpDiscount(deal)).toBe(true);
    expect(shouldShowDealMsrpDiscount({ ...deal, status: 'Pending' })).toBe(false);
    expect(getDealMsrpDiscountPercent({ sunhub_price: 120, msrp: 100 })).toBe(0);
  });
});
