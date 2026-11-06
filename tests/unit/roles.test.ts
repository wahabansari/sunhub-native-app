import { hasRole, isCustomer, isReseller, isSeller } from '@/utils/roles';

describe('role helpers', () => {
  it('matches roles case-insensitively', () => {
    expect(hasRole(['seller', 'customer'], 'SELLER')).toBe(true);
    expect(hasRole([' seller '], 'seller')).toBe(true);
    expect(hasRole(['customer'], 'seller')).toBe(false);
  });

  it('exposes common role checks', () => {
    expect(isSeller(['customer', 'seller'])).toBe(true);
    expect(isCustomer(['customer'])).toBe(true);
    expect(isReseller(['reseller'])).toBe(true);
    expect(isSeller([])).toBe(false);
  });
});
