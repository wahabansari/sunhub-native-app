export type CategoryArtKey = 'panel' | 'inv' | 'bat' | 'rack' | 'comp' | 'diy' | 'ev';

export interface HomeCategory {
  id: string;
  name: string;
  art: CategoryArtKey;
  /** Top-level catalog category id used to filter fixed-price products. */
  parentId: number;
}

export interface HomeProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  imageUrl?: string;
  shippingLabel?: string;
  stock?: number;
  /** Minimum order quantity; 1 when the listing does not set one. */
  moq?: number;
  sponsorLabel?: string;
  badges: string[];
  brand?: string;
  category?: string;
  condition?: string;
}

export interface HomeDeal {
  id: string;
  name: string;
  pricePerWatt: number;
  compareAt?: number;
  moq?: string;
  location?: string;
  imageUrl?: string;
  sponsored?: boolean;
  brand?: string;
  wattage?: string;
  moqUnit?: string;
  shipping?: string;
  category?: string;
  /** Panels are priced per watt; every other listing type is priced per unit. */
  perWatt: boolean;
  badges: string[];
}

export interface HomeBrand {
  id: string;
  name: string;
  initials: string;
  logoUrl?: string;
}

export interface HomeArticle {
  id: string;
  title: string;
  category: string;
  imageUrl?: string;
  /** Public article page, opened in the browser. */
  url?: string;
}

export interface HomeReview {
  id: string;
  name: string;
  date: string;
  text: string;
}

export interface PickupState {
  code: string;
  total: number;
}
