import { USER_ROLES } from '@/constants/app';

export function hasRole(roles: readonly string[], role: string): boolean {
  const expected = role.trim().toLowerCase();
  return roles.some((entry) => entry.trim().toLowerCase() === expected);
}

export function isSeller(roles: readonly string[]): boolean {
  return hasRole(roles, USER_ROLES.seller);
}

export function isCustomer(roles: readonly string[]): boolean {
  return hasRole(roles, USER_ROLES.customer);
}

export function isReseller(roles: readonly string[]): boolean {
  return hasRole(roles, USER_ROLES.reseller);
}

/** What to call a signed-in user's role set: Buyer, Seller, or Buyer & Seller. */
export function roleLabel(roles: readonly string[]): string {
  const buyer = isCustomer(roles);
  const seller = isSeller(roles);

  if (buyer && seller) return 'Buyer & Seller';
  if (seller) return 'Seller';
  if (buyer) return 'Buyer';
  return 'Member';
}
