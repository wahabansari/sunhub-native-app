import { describe, expect, it } from 'vitest';

process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';

const {
  cartShippingValue,
  clampQuantity,
  normalizeCart,
  parseFedexRates,
  parseTotals,
  shippingOptionsFor,
  unitPriceFor,
} = await import('@/services/cart/cart-mappers');

const row = (overrides: Record<string, unknown> = {}, item: Record<string, unknown> = {}) => ({
  item_uuid: 'P1',
  qty: 2,
  shipping_cost: 11.4,
  item: {
    uuid: 'P1',
    name: 'Panel',
    price: '100.00',
    moq: 1,
    total_qty: 50,
    condition: 'new',
    shipping_type: 'estimated_shipping',
    images: [],
    brand: { name: 'Trina' },
    ...item,
  },
  ...overrides,
});

describe('cart pricing', () => {
  it('applies percent and fixed discounts', () => {
    expect(unitPriceFor({ price: '200', discount: 10, discount_unit: 'percent' }, 1)).toBe(180);
    expect(unitPriceFor({ price: '200', discount: 15, discount_unit: 'fixed' }, 1)).toBe(185);
  });

  it('uses the bulk tier the quantity falls in', () => {
    const item = {
      price: '100',
      scalling_price: 1,
      bulk_savings: [
        { min_qty: 1, max_qty: 9, discounted_price: 95 },
        { min_qty: 10, max_qty: 99, discounted_price: 90 },
      ],
    };

    expect(unitPriceFor(item, 5)).toBe(95);
    expect(unitPriceFor(item, 10)).toBe(90);
    expect(unitPriceFor(item, 500)).toBe(100);
  });

  it('clamps quantities between the minimum order and the stock', () => {
    expect(clampQuantity(0, 5, 100)).toBe(5);
    expect(clampQuantity(500, 5, 100)).toBe(100);
    expect(clampQuantity(7.9, 1, 100)).toBe(7);
    expect(clampQuantity(3, 10, 4)).toBe(10);
  });
});

describe('normalizeCart', () => {
  it('totals only the items that can be bought', () => {
    const cart = normalizeCart({
      data: [
        row(),
        row({ item_uuid: 'P2', qty: 1 }, { uuid: 'P2', price: '50', total_qty: 0 }),
        row({ item_uuid: 'P3', qty: 1 }, { uuid: 'P3', price: '10', moq: 5, total_qty: 3 }),
      ],
    });

    expect(cart.itemCount).toBe(3);
    expect(cart.subtotal).toBe(200);
    expect(cart.hasOutOfStock).toBe(true);
    expect(cart.items.map((item) => item.outOfStock)).toEqual([false, true, true]);
  });

  it('reads display fields and ignores malformed rows', () => {
    const cart = normalizeCart({
      data: [row(), null, { item_uuid: 'x' }, row({}, { uuid: '', name: 'No id' })],
    });

    expect(cart.items).toHaveLength(2);
    expect(cart.items[0]).toMatchObject({
      uuid: 'P1',
      name: 'Panel',
      brand: 'Trina',
      condition: 'New',
      qty: 2,
      unitPrice: 100,
      lineTotal: 200,
      shippingOptions: ['CALCULATED'],
      shippingCost: 11.4,
    });
    expect(normalizeCart(undefined)).toMatchObject({ items: [], subtotal: 0, itemCount: 0 });
  });
});

describe('shipping and totals parsing', () => {
  it('maps product shipping types to delivery choices', () => {
    expect(shippingOptionsFor('fedex_or_local_pickup')).toEqual(['FEDEX', 'LOCAL_PICKUP']);
    expect(shippingOptionsFor('free_shipping')).toEqual(['FREE_SHIPPING']);
    expect(shippingOptionsFor('mystery')).toEqual([]);
    expect(cartShippingValue('CALCULATED')).toBe('ESTIMATED_SHIPPING');
    expect(cartShippingValue('FEDEX')).toBe('FEDEX_GROUND');
    expect(cartShippingValue('LOCAL_PICKUP')).toBe('LOCAL_PICKUP');
  });

  it('reads server totals and rejects unusable ones', () => {
    expect(
      parseTotals({ data: { shipping_cost: 11.4, tax: 0, strip_fee: 11.1025, total: 372.5026 } }),
    ).toEqual({ shipping: 11.4, tax: 0, processingFee: 11.1, total: 372.5 });
    expect(parseTotals({ data: { total: 'abc' } })).toBeNull();
    expect(parseTotals({ data: { total: -1 } })).toBeNull();
    expect(parseTotals({})).toBeNull();
  });

  it('flattens FedEx package rates', () => {
    expect(
      parseFedexRates({
        data: {
          packages: [{ rates: { FEDEX_GROUND: '23.5', FEDEX_2_DAY: 40 } }, { rates: { BAD: 'x' } }],
        },
      }),
    ).toEqual([
      { service: 'FEDEX_GROUND', price: 23.5 },
      { service: 'FEDEX_2_DAY', price: 40 },
    ]);
  });
});
