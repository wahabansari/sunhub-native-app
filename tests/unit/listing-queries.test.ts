import { describe, expect, it } from 'vitest';

import {
  buildDealQuery,
  buildProductBody,
  cleanSearch,
  parseWattage,
} from '@/services/catalog/listing-queries';

describe('listing queries', () => {
  it('strips wildcard characters from search text', () => {
    expect(cleanSearch('  50%_off \\ panel  ')).toBe('50 off panel');
    expect(cleanSearch(undefined)).toBe('');
    expect(cleanSearch('x'.repeat(200))).toHaveLength(80);
  });

  it('parses wattage buckets', () => {
    expect(parseWattage('400,495')).toEqual([400, 495]);
    expect(parseWattage('600')).toEqual([600]);
    expect(parseWattage('1,2,3')).toBeUndefined();
    expect(parseWattage('abc')).toBeUndefined();
    expect(parseWattage(undefined)).toBeUndefined();
  });

  it('builds the base product body without optional filters', () => {
    const body = buildProductBody({}, 2);

    expect(body.where).toEqual([
      ['is_active', 1],
      ['total_qty', '>', 0],
      ['status', 'approved'],
    ]);
    expect(body.where_in).toEqual([]);
    expect(body).toMatchObject({ page: 2, limit: 20 });
    expect(body).not.toHaveProperty('where_has');
    expect(body).not.toHaveProperty('availability');
  });

  it('maps every shop sidebar group onto the products search body', () => {
    const body = buildProductBody(
      {
        selection: {
          availability: ['1'],
          category: ['40939'],
          wattage: ['400,495'],
          condition: ['new', 'pre_owned'],
          shipping: ['local_pickup_only', 'free_shipping'],
          compliance: ['cec_listed'],
          brand: ['233', '76', 'bad'],
        },
        search: 'trina%',
      },
      1,
    );

    expect(body.where).toContainEqual(['name', 'like', '%trina%']);
    expect(body.where_has).toEqual({ category: { where: [['parent_id', 40939]] } });
    expect(body.availability).toBe(1);
    expect(body.compliance).toEqual(['cec_listed']);
    expect(body.dynamic_fields_key).toBe('watts');
    expect(body.dynamic_fields_value).toEqual([400, 495]);
    expect(body.where_in).toEqual(
      expect.arrayContaining([
        { field: 'brand_id', value: [233, 76] },
        { field: 'condition', value: ['new', 'pre_owned'] },
        {
          field: 'shipping_type',
          value: ['local_pickup_only', 'free_shipping', 'fedex_or_local_pickup'],
        },
      ]),
    );
  });

  it('filters by sub-category instead of the parent category when one is chosen', () => {
    const body = buildProductBody(
      { selection: { category: ['40939'], subcategory: ['41117', '41118'] } },
      1,
    );

    expect(body.where_in).toContainEqual({ field: 'category_id', value: [41117, 41118] });
    expect(body).not.toHaveProperty('where_has');
  });

  it('can restrict products to sponsored ones', () => {
    const body = buildProductBody({ sponsored: true }, 1, 6);

    expect(body.where).toContainEqual(['is_featured_product', 1]);
    expect(body.limit).toBe(6);
  });

  it('encodes deal query values and skips empty filters', () => {
    expect(buildDealQuery({}, 1)).toBe('limit=20&page=1');
    expect(
      buildDealQuery(
        {
          selection: {
            type: ['panels'],
            state: ['CA', 'TX'],
            brand: ['Trina Solar'],
            wattage: ['400,495'],
            color: ['Black'],
            incoterms: ['EXW'],
            tier: ['Tier 1'],
            availability: ['1'],
            condition: ['new', 'pre owned'],
            compliance: ['cec_listed', 'feoc_compliant'],
            subcategory: ['Bifacial'],
          },
          search: 'a&b=c',
        },
        3,
      ),
    ).toBe(
      'limit=20&page=3&listing_type=panels&sub_category=Bifacial&brand=Trina%20Solar' +
        '&condition=new%2Cpre%20owned&state=CA%2CTX&incoterms=EXW&colors=Black&wattage=400%2C495' +
        '&company_tier=Tier%201&availability=1&cec_listed=true&feoc_compliant=true&search=a%26b%3Dc',
    );
  });
});
