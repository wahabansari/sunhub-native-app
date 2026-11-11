import { describe, expect, it } from 'vitest';

import {
  dealPrice,
  decodeHtmlEntities,
  formatMoney,
  formatPerWatt,
  initialsOf,
  listingLabel,
  moqLabel,
  wattageOf,
} from '@/utils/home-format';

describe('home-format', () => {
  it('decodes named and numeric HTML entities and strips tags', () => {
    expect(decodeHtmlEntities('Snow &amp; Wind &#8217;26 <b>Load</b>')).toBe(
      'Snow & Wind ’26 Load',
    );
    expect(decodeHtmlEntities('Fish &unknown; chips')).toBe('Fish &unknown; chips');
  });

  it('formats per-watt and money values', () => {
    expect(formatPerWatt(0.19)).toBe('$0.190');
    expect(formatPerWatt(0.24, 4)).toBe('$0.2400');
    expect(formatPerWatt(Number.NaN)).toBe('');
    expect(formatMoney(9450)).toBe('$9,450.00');
  });

  it('prices panels per watt and other listings per unit', () => {
    expect(dealPrice({ pricePerWatt: 0.294, perWatt: true }, 4)).toEqual({
      amount: '$0.2940',
      short: '/W',
      long: 'per watt',
    });
    expect(dealPrice({ pricePerWatt: 3720.6, perWatt: false })).toEqual({
      amount: '$3,720.60',
      short: '',
      long: 'per unit',
    });
  });

  it('reads wattage from the field or the deal name', () => {
    expect(wattageOf({ wattage: '415 W', name: 'x' })).toBe('415');
    expect(wattageOf({ name: 'Trina Solar 440W' })).toBe('440');
    expect(wattageOf({ name: 'Inverter' })).toBeNull();
  });

  it('builds initials and listing labels', () => {
    expect(initialsOf('Mark Scarberry')).toBe('MS');
    expect(initialsOf('Gstar')).toBe('G');
    expect(listingLabel('panels')).toBe('Panel');
    expect(listingLabel('')).toBeUndefined();
  });

  it('labels the MOQ with a singular or plural unit', () => {
    expect(moqLabel('2', 'pallets')).toBe('2 pallets');
    expect(moqLabel('1', 'pallets')).toBe('1 pallet');
    expect(moqLabel('3 pallets', 'pallets')).toBe('3 pallets');
    expect(moqLabel(undefined, undefined)).toBe('1 pallet');
  });
});
