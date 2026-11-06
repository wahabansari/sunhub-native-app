import { capitalizeWords, formatCurrency, formatDate, formatPhoneNumber } from '@/utils/format';

describe('format helpers', () => {
  it('formats US phone numbers progressively', () => {
    expect(formatPhoneNumber('')).toBe('');
    expect(formatPhoneNumber('123')).toBe('(123)');
    expect(formatPhoneNumber('123456')).toBe('(123) 456');
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('(123) 456-7890 ext 99')).toBe('(123) 456-7890');
  });

  it('capitalizes words', () => {
    expect(capitalizeWords('  solar   PANEL ')).toBe('Solar Panel');
    expect(capitalizeWords('')).toBe('');
  });

  it('formats currency and dates', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
    expect(formatCurrency(Number.NaN)).toBe('');
    expect(formatDate(new Date(2026, 10, 6))).toBe('Nov 6, 2026');
    expect(formatDate('not-a-date')).toBe('');
  });
});
