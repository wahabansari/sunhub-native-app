import type { FilterOption } from '@/types/listing';

// Option sets mirror the sidebars on sunhub.com (shop and trader listings).

export const AVAILABILITY_OPTIONS: FilterOption[] = [
  { value: '1', label: 'In stock' },
  { value: '0', label: 'Request inventory' },
];

/** Panel wattage buckets; the value is `min,max` (or just `min` for the open-ended bucket). */
export const WATTAGE_OPTIONS: FilterOption[] = [
  { value: '300,395', label: '300 - 395 Watts' },
  { value: '400,495', label: '400 - 495 Watts' },
  { value: '500,595', label: '500 - 595 Watts' },
  { value: '600', label: '600+ Watts' },
];

export const PRODUCT_CONDITION_OPTIONS: FilterOption[] = [
  { value: 'new', label: 'New' },
  { value: 'pre_owned', label: 'Pre-owned' },
  { value: 'for_parts', label: 'For parts' },
  { value: 'seller_refurbished', label: 'Seller refurbished' },
];

/** The deal listing API stores "pre owned" and "for parts" with a space. */
export const DEAL_CONDITION_OPTIONS: FilterOption[] = [
  { value: 'new', label: 'New' },
  { value: 'pre owned', label: 'Pre-owned' },
  { value: 'for parts', label: 'For parts' },
  { value: 'seller_refurbished', label: 'Seller refurbished' },
];

export const SHIPPING_OPTIONS: FilterOption[] = [
  { value: 'local_pickup_only', label: 'Local pickup' },
  { value: 'free_shipping', label: 'Free shipping' },
  { value: 'estimated_shipping', label: 'Calculated at checkout' },
];

export const COLOR_OPTIONS: FilterOption[] = [
  { value: 'Black', label: 'Black' },
  { value: 'Silver', label: 'Silver' },
];

export const TIER_OPTIONS: FilterOption[] = [{ value: 'Tier 1', label: 'Tier 1' }];

export const COMPLIANCE_FILTER_OPTIONS: FilterOption[] = [
  { value: 'cec_listed', label: 'CEC Listed' },
  { value: 'feoc_compliant', label: 'FEOC Compliant' },
];

export const DEAL_TYPE_OPTIONS: FilterOption[] = [
  { value: 'panels', label: 'Solar panels' },
  { value: 'inverters', label: 'Inverters' },
  { value: 'batteries', label: 'Batteries' },
  { value: 'others', label: 'Other equipment' },
];

/** Catalog category ids that carry the extra panel / inverter filter groups. */
export const PANELS_CATEGORY_ID = '40939';
export const INVERTERS_CATEGORY_ID = '40948';

/** Broker listing type -> the sidebar category whose children are its sub-categories. */
export const DEAL_TYPE_CATEGORY_NAME: Record<string, string> = {
  panels: 'Solar Panels',
  inverters: 'Solar Inverters',
  batteries: 'Solar Batteries',
};
