/** Stable query keys shared by hooks and mutation invalidation. */
export const queryKeys = {
  home: ['home'] as const,
  products: (filters: unknown = {}) => ['products', filters] as const,
  product: (id: string) => ['products', id] as const,
  categories: (filters: unknown = {}) => ['categories', filters] as const,
  brands: (filters: unknown = {}) => ['brands', filters] as const,
  listings: (filters: unknown = {}) => ['listings', filters] as const,
  profile: ['profile'] as const,
  cart: ['cart'] as const,
} as const;
