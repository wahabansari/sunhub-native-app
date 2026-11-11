export type ListingMode = 'negotiable' | 'buy';
export type ComplianceKey = 'cec_listed' | 'feoc_compliant';

/** Selected values per filter section key, as edited in the filter sheet. */
export type FilterSelection = Record<string, string[]>;

/**
 * Product filters. The selection keys are: availability, category, subcategory, wattage, condition,
 * sector, shipping, compliance, brand (the groups shown on sunhub.com's shop sidebar).
 */
export interface ProductFilters {
  selection?: FilterSelection;
  /** Only products the seller pays to feature. */
  sponsored?: boolean;
  search?: string;
}

/**
 * Deal filters. The selection keys are: availability, type, subcategory, tier, wattage, color, state,
 * incoterms, sector, condition, compliance, brand (the groups on the trader sidebar).
 */
export interface DealFilters {
  selection?: FilterSelection;
  search?: string;
}

export type FilterOption = { value: string; label: string; count?: number };

export type FilterSection = {
  key: string;
  title: string;
  options: FilterOption[];
  /** Allow more than one value; otherwise picking an option replaces the previous one. */
  multiple?: boolean;
};

export interface ResultPage<T> {
  items: T[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface DetailSpec {
  label: string;
  value: string;
}

export interface DetailDocument {
  name: string;
  url: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  price: number;
  unit: string;
  stock: number;
  moq: number;
  imageUrls: string[];
  sponsorLabel?: string;
  badges: string[];
  shippingLabel: string;
  description?: string;
  specs: DetailSpec[];
}

export interface DealDetail {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  subCategory?: string;
  perWatt: boolean;
  price: number;
  compareAt?: number;
  discountPercent?: number;
  imageUrls: string[];
  location: string;
  moq: string;
  available?: string;
  shipping?: string;
  paymentTerms?: string;
  sponsored: boolean;
  badges: string[];
  estimateAtMoq?: { panels: number; total: number };
  description?: string;
  specs: DetailSpec[];
  documents: DetailDocument[];
}

export interface BrandOption {
  id: number;
  name: string;
}

export interface DealFilterOptions {
  states: FilterOption[];
  brands: FilterOption[];
  incoterms: FilterOption[];
  sectors: FilterOption[];
  /** Sub-category names per broker listing type (panels, inverters, batteries). */
  subCategories: Record<string, FilterOption[]>;
}
