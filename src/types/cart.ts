/** How one cart item reaches the buyer; mirrors the web `getProductShipping` options. */
export type ShippingChoice = 'FREE_SHIPPING' | 'LOCAL_PICKUP' | 'CALCULATED' | 'FEDEX';

export interface CartItem {
  /** Product uuid; the key every cart call uses. */
  uuid: string;
  name: string;
  imageUrl?: string;
  brand?: string;
  condition?: string;
  qty: number;
  moq: number;
  stock: number;
  /** Price per unit after discount or bulk pricing, as the server returned the item. */
  unitPrice: number;
  lineTotal: number;
  shippingOptions: ShippingChoice[];
  /** Estimated shipping the server attached to this row. */
  shippingCost: number;
  outOfStock: boolean;
}

export interface Cart {
  items: CartItem[];
  /** Sum of every available item's line total; display only. The server prices the order. */
  subtotal: number;
  itemCount: number;
  hasOutOfStock: boolean;
}

export interface ShippingAddress {
  address: string;
  city: string;
  /** Two-letter US state code. */
  state: string;
  zip: string;
}

/** Totals exactly as the server calculated them for this cart and address. */
export interface OrderTotals {
  shipping: number;
  tax: number;
  processingFee: number;
  total: number;
}

export interface FedexRate {
  service: string;
  price: number;
}

/** A saved shipping address from the buyer's profile. */
export interface SavedAddress extends ShippingAddress {
  id: string;
  name: string;
  /** Contact number saved with the address, when the profile has one. */
  phone?: string;
}

/** A saved card from the buyer's profile. Only display fields; the card number never reaches the app. */
export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expiration: string;
  holder: string;
  billingSummary: string;
}

export interface GuestContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/** What the confirmation screen may show; taken from the checkout response and never stored. */
export interface PlacedOrder {
  total?: number;
  tax?: number;
  shipping?: number;
  email?: string;
}
