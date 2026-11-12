export interface OrderLine {
  name: string;
  qty: number;
}

/** One purchase from the buyer's order history. */
export interface OrderSummary {
  id: string;
  number: string;
  date?: string;
  status: string;
  total: number;
  shipping: number;
  tax: number;
  lines: OrderLine[];
}

/** One product in a seller's own catalog. */
export interface SellerListing {
  uuid: string;
  name: string;
  price: number;
  stock: number;
  unit: string;
  isActive: boolean;
  status: string;
  imageUrl?: string;
}

/** One order a seller has sold. */
export interface SoldItem {
  id: string;
  customer: string;
  date?: string;
  status: string;
  total: number;
  shipping: number;
  shippingType: string;
}

export interface AccountPage<T> {
  items: T[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface PasswordChange {
  current: string;
  next: string;
  confirmation: string;
}
