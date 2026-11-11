import { describe, expect, it } from 'vitest';

import type { DealFilterOptions } from '@/types/listing';
import {
  countSelected,
  dealSections,
  normalizeDealSelection,
  normalizeProductSelection,
  parseDealParams,
  parseProductParams,
  productSections,
} from '@/utils/listing-filters';

const dealOptions: DealFilterOptions = {
  states: [{ value: 'CA', label: 'CA', count: 226 }],
  brands: [{ value: 'SMA', label: 'SMA' }],
  incoterms: [{ value: 'EXW', label: 'EXW - Ex Works (Place)', count: 1349 }],
  sectors: [{ value: 'residential', label: 'Residential', count: 142 }],
  subCategories: { panels: [{ value: 'Bifacial', label: 'Bifacial' }], inverters: [] },
};

const productData = {
  brands: [{ id: 233, name: 'Canadian Solar Inc' }],
  subCategories: { '40939': [{ value: '41117', label: 'Bifacial' }] },
  sectors: [{ value: 'Residential', label: 'Residential', count: 41 }],
};

const keys = (sections: { key: string }[]) => sections.map((section) => section.key);

describe('listing filters', () => {
  it('parses product route params and ignores invalid values', () => {
    expect(
      parseProductParams({ category: '40939', brand: 'abc', cec_listed: '1', feoc_compliant: '0' }),
    ).toEqual({
      selection: { category: ['40939'], compliance: ['cec_listed'] },
      search: undefined,
    });
    expect(parseProductParams({ category: ['41094', '1'], q: ' inverter ' })).toMatchObject({
      selection: { category: ['41094'] },
      search: 'inverter',
    });
  });

  it('parses deal route params and validates state and type', () => {
    expect(parseDealParams({ state: 'tx', type: 'panels', brand: 'SMA', q: 'x' })).toEqual({
      selection: { type: ['panels'], state: ['TX'], brand: ['SMA'] },
      search: 'x',
    });
    expect(parseDealParams({ state: 'Texas', type: 'nope' }).selection).toEqual({});
  });

  it('drops dependent product values when their category is not chosen', () => {
    expect(
      normalizeProductSelection({
        category: ['40948'],
        subcategory: ['1'],
        wattage: ['600'],
        sector: ['Residential'],
      }),
    ).toEqual({ category: ['40948'], subcategory: ['1'], sector: ['Residential'] });
    expect(
      normalizeProductSelection({ wattage: ['600'], subcategory: ['1'], brand: ['2'] }),
    ).toEqual({
      brand: ['2'],
    });
  });

  it('drops dependent deal values when their category is not chosen', () => {
    expect(
      normalizeDealSelection({
        type: ['batteries'],
        wattage: ['600'],
        color: ['Black'],
        sector: ['x'],
      }),
    ).toEqual({ type: ['batteries'] });
    expect(
      normalizeDealSelection({ type: ['panels'], wattage: ['600'], color: ['Black'] }),
    ).toEqual({ type: ['panels'], wattage: ['600'], color: ['Black'] });
  });

  it('shows the shop sidebar groups, adding panel and sub-category groups per category', () => {
    expect(keys(productSections(productData, {}))).toEqual([
      'availability',
      'category',
      'condition',
      'shipping',
      'compliance',
      'brand',
    ]);
    expect(keys(productSections(productData, { category: ['40939'] }))).toEqual([
      'availability',
      'category',
      'subcategory',
      'wattage',
      'condition',
      'shipping',
      'compliance',
      'brand',
    ]);
    expect(keys(productSections(productData, { category: ['40948'] }))).toContain('sector');
  });

  it('shows the trader sidebar groups, adding panel and inverter groups per type', () => {
    expect(keys(dealSections(dealOptions, {}))).toEqual([
      'availability',
      'type',
      'tier',
      'state',
      'incoterms',
      'condition',
      'compliance',
      'brand',
    ]);
    expect(keys(dealSections(dealOptions, { type: ['panels'] }))).toEqual([
      'availability',
      'type',
      'subcategory',
      'tier',
      'wattage',
      'color',
      'state',
      'incoterms',
      'condition',
      'compliance',
      'brand',
    ]);
    expect(keys(dealSections(dealOptions, { type: ['inverters'] }))).toContain('sector');
  });

  it('counts selected values', () => {
    expect(countSelected({ state: ['CA', 'TX'], type: ['panels'] })).toBe(3);
    expect(countSelected(undefined)).toBe(0);
  });
});
