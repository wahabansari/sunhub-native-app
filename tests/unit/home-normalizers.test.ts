import { describe, expect, it } from 'vitest';

process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';

const { normalizeArticle, normalizeBrand, normalizeDeal, normalizePickupStates, normalizeProduct } =
  await import('@/services/catalog/catalog-normalizers');

describe('home normalizers', () => {
  it('reads state deal counts from the broker sidebar payload', () => {
    const payload = {
      data: {
        state: {
          data: [
            { state: 'CA', count: 828 },
            { state: 'tx', count: 211 },
            { state: 'ZZZ', count: 5 },
            { state: 'NV', count: 0 },
          ],
        },
      },
    };

    expect(normalizePickupStates(payload)).toEqual([
      { code: 'CA', total: 828 },
      { code: 'TX', total: 211 },
    ]);
    expect(normalizePickupStates(undefined)).toEqual([]);
    expect(normalizePickupStates({ data: {} })).toEqual([]);
  });

  it('falls back to attachments when images is an empty array and skips documents', () => {
    const deal = normalizeDeal(
      {
        listing_id: 'A1',
        title: 'CW Energy 635W',
        images: [],
        attachments: [
          { type: 'Document', path: 'attachments/spec.pdf' },
          { type: 'Image', path: 'attachments/panel%20a.jpg' },
        ],
      },
      0,
    );

    expect(deal.imageUrl).toMatch(/\/attachments\/panel%20a\.jpg$/);
  });

  it('keeps numeric wattage and marks only panels as per-watt priced', () => {
    const panel = normalizeDeal({ listing_id: 'P', listing_type: 'panels', wattage: 635 }, 0);
    const inverter = normalizeDeal(
      { listing_id: 'I', listing_type: 'inverters', sunhub_price: 3720.6 },
      1,
    );

    expect(panel).toMatchObject({ wattage: '635', perWatt: true });
    expect(inverter).toMatchObject({ pricePerWatt: 3720.6, perWatt: false, category: 'Inverter' });
  });

  it('builds sponsor and compliance badges for products', () => {
    const product = normalizeProduct(
      {
        uuid: 'X1',
        name: 'Panel',
        price: '188.00',
        is_featured_product: 1,
        custom_tag: 'A very long custom tag that overflows',
        cec_listed: true,
        feoc_compliant: false,
      },
      0,
    );

    expect(product.sponsorLabel).toBe('A very long custom …');
    expect(product.badges).toEqual(['CEC Listed']);
    expect(normalizeProduct({ uuid: 'X2', is_featured_product: 1 }, 1).sponsorLabel).toBe(
      'Sponsored',
    );
    expect(
      normalizeProduct({ uuid: 'X3', is_featured_product: 0 }, 2).sponsorLabel,
    ).toBeUndefined();
  });

  it('decodes article titles and picks the embedded featured image', () => {
    const article = normalizeArticle(
      {
        id: 7,
        title: { rendered: 'Snow &amp; Wind Load Ratings' },
        _embedded: { 'wp:featuredmedia': [{ source_url: 'https://www.sunhub.com/a.jpg' }] },
      },
      0,
    );

    expect(article).toMatchObject({
      id: '7',
      title: 'Snow & Wind Load Ratings',
      imageUrl: 'https://www.sunhub.com/a.jpg',
    });
  });

  it('ignores non-https article images', () => {
    const article = normalizeArticle(
      {
        id: 8,
        title: { rendered: 'x' },
        _embedded: { 'wp:featuredmedia': [{ source_url: 'http://a/b.jpg' }] },
      },
      0,
    );

    expect(article.imageUrl).toBeUndefined();
  });

  it('keeps absolute brand logos and prefixes relative ones', () => {
    expect(
      normalizeBrand({ id: 1, name: 'SMA', logo: 'https://cdn.example.com/sma.png' }, 0).logoUrl,
    ).toBe('https://cdn.example.com/sma.png');
    expect(normalizeBrand({ id: 2, name: 'REC', logo: '/data/rec.png' }, 1).logoUrl).toMatch(
      /\/data\/rec\.png$/,
    );
    expect(normalizeBrand({ id: 3, name: 'No Logo' }, 2).logoUrl).toBeUndefined();
  });

  it('keeps numeric MOQ values and labels the listing type', () => {
    const deal = normalizeDeal({ id: 1, name: 'Trina 440W', moq: 2, listing_type: 'panels' }, 0);

    expect(deal.moq).toBe('2');
    expect(deal.category).toBe('Panel');
  });
});
