import { asNonEmptyString, asString, asStringArray, isRecord } from '@/utils/guards';

describe('guards', () => {
  it('identifies plain records', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
    expect(isRecord('value')).toBe(false);
  });

  it('reads strings safely', () => {
    expect(asString('value')).toBe('value');
    expect(asString(42)).toBeNull();
    expect(asNonEmptyString('  value  ')).toBe('value');
    expect(asNonEmptyString('   ')).toBeNull();
  });

  it('filters string arrays', () => {
    expect(asStringArray(['a', 1, null, 'b'])).toEqual(['a', 'b']);
    expect(asStringArray('a')).toEqual([]);
  });
});
