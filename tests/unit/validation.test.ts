import {
  isNonEmpty,
  isValidEmail,
  isValidUsPhone,
  isValidZipCode,
  isWholeNumber,
} from '@/utils/validation';

describe('validation helpers', () => {
  it('checks non-empty strings', () => {
    expect(isNonEmpty(' value ')).toBe(true);
    expect(isNonEmpty('   ')).toBe(false);
    expect(isNonEmpty(undefined)).toBe(false);
  });

  it('checks emails', () => {
    expect(isValidEmail('person@example.test')).toBe(true);
    expect(isValidEmail('person@example')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
  });

  it('checks zip codes and US phone numbers', () => {
    expect(isValidZipCode('90210')).toBe(true);
    expect(isValidZipCode('9021')).toBe(false);
    expect(isValidUsPhone('(310) 555-1212')).toBe(true);
    expect(isValidUsPhone('555-1212')).toBe(false);
  });

  it('checks whole numbers', () => {
    expect(isWholeNumber(0)).toBe(true);
    expect(isWholeNumber('42')).toBe(true);
    expect(isWholeNumber(4.2)).toBe(false);
    expect(isWholeNumber('')).toBe(false);
  });
});
