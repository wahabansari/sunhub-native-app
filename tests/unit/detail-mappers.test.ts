import { describe, expect, it } from 'vitest';

process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';

const { mapDealDetail, mapProductDetail } = await import('@/services/catalog/detail-mappers');

describe('detail mappers', () => {
  it('maps a product with images, badges and specifications', () => {
    const product = mapProductDetail({
      uuid: '3JEAO',
      name: 'ZNShine 595W',
      price: '188.00',
      total_qty: 72,
      moq: 4,
      condition: 'new',
      age: 0,
      weight: '69.44',
      weight_unit: 'lb',
      length: 89.68,
      width: 44.64,
      height: 1.18,
      length_unit: 'in',
      cec_listed: true,
      images: [{ type: 'image', path: 'pictures/item/a.jpg' }],
      brand: { name: 'Znshine Solar' },
      category: { name: 'Bifacial' },
      description: '<p>Great &amp; efficient</p><p>Second line</p>',
      dynamic_fields: { watts: { label: 'Watts', value: 595 } },
    });

    expect(product).toMatchObject({
      id: '3JEAO',
      brand: 'Znshine Solar',
      category: 'Bifacial',
      price: 188,
      moq: 4,
      stock: 72,
      badges: ['CEC Listed'],
    });
    expect(product?.imageUrls[0]).toMatch(/pictures\/item\/a\.jpg$/);
    expect(product?.description).toBe('Great & efficient\nSecond line');
    expect(product?.specs).toEqual(
      expect.arrayContaining([
        { label: 'Condition', value: 'New' },
        { label: 'Weight', value: '69.44 lb' },
        { label: 'Dimensions', value: '89.68 × 44.64 × 1.18 in' },
        { label: 'Watts', value: '595' },
      ]),
    );
  });

  it('rejects a product without a uuid', () => {
    expect(mapProductDetail({ name: 'x' })).toBeNull();
  });

  it('maps a panel deal with an estimate at MOQ, documents and compliance', () => {
    const deal = mapDealDetail({
      listing_id: '9587UNUY',
      listing_type: 'panels',
      title: 'CW Energy 635W',
      brand: 'CW Energy USA',
      sub_category: 'Bifacial',
      sunhub_price: 0.294,
      msrp: 0.35,
      moq: 2,
      moq_unit: 'pallets',
      wattage: 635,
      pallet_quantity: 31,
      city: 'Carlstadt',
      state: 'NJ',
      cec_listed: true,
      qoh: { pallet: 15.81, panel: 490 },
      quantity_calculator: 'qoh',
      terms: { incoterms: 'EXW - Ex Works (Place)', payment_terms: '<p>To Be Decided</p>' },
      attachments: [
        { type: 'Image', path: 'attachments/a.jpg' },
        { type: 'Document', path: 'attachments/spec.pdf', label: 'Datasheet' },
      ],
    });

    expect(deal).toMatchObject({
      id: '9587UNUY',
      perWatt: true,
      price: 0.294,
      compareAt: 0.35,
      discountPercent: 16,
      location: 'Carlstadt, NJ',
      moq: '2 pallets',
      available: '490 panels · 15.81 pallets',
      paymentTerms: 'To Be Decided',
      badges: ['CEC Listed'],
    });
    expect(deal?.estimateAtMoq?.panels).toBe(62);
    expect(deal?.estimateAtMoq?.total).toBeCloseTo(62 * 635 * 0.294, 5);
    expect(deal?.imageUrls).toHaveLength(1);
    expect(deal?.documents).toEqual([
      { name: 'Datasheet', url: expect.stringMatching(/attachments\/spec\.pdf$/) },
    ]);
  });

  it('skips the watt estimate for non-panel deals and hides disabled deals', () => {
    const inverter = mapDealDetail({
      listing_id: 'I1',
      listing_type: 'inverters',
      title: 'Sol-Ark 12kW',
      sunhub_price: 3720.6,
      moq: 1,
      wattage: 12000,
      pallet_quantity: 1,
    });

    expect(inverter?.perWatt).toBe(false);
    expect(inverter?.estimateAtMoq).toBeUndefined();
    expect(mapDealDetail({ listing_id: 'X', status: 'Disabled' })).toBeNull();
  });
});
