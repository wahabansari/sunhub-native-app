import { HOME_CATEGORIES } from '@/constants/home-content';
import {
  AVAILABILITY_OPTIONS,
  COLOR_OPTIONS,
  COMPLIANCE_FILTER_OPTIONS,
  DEAL_CONDITION_OPTIONS,
  DEAL_TYPE_OPTIONS,
  INVERTERS_CATEGORY_ID,
  PANELS_CATEGORY_ID,
  PRODUCT_CONDITION_OPTIONS,
  SHIPPING_OPTIONS,
  TIER_OPTIONS,
  WATTAGE_OPTIONS,
} from '@/constants/listing-options';
import type {
  BrandOption,
  DealFilterOptions,
  DealFilters,
  FilterOption,
  FilterSection,
  FilterSelection,
  ProductFilters,
} from '@/types/listing';

const STATE_CODE = /^[A-Z]{2}$/;
const COMPLIANCE_KEYS = COMPLIANCE_FILTER_OPTIONS.map((option) => option.value);
const DEAL_TYPES = DEAL_TYPE_OPTIONS.map((option) => option.value);

type Params = Record<string, string | string[] | undefined>;

function single(params: Params, key: string): string | undefined {
  const raw = params[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() ? value.trim() : undefined;
}

function positiveInt(value: string | undefined): string[] {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? [String(parsed)] : [];
}

function compact(selection: FilterSelection): FilterSelection {
  return Object.fromEntries(Object.entries(selection).filter(([, values]) => values.length));
}

export function parseProductParams(params: Params): ProductFilters {
  return {
    selection: compact({
      category: positiveInt(single(params, 'category')),
      brand: positiveInt(single(params, 'brand')),
      compliance: COMPLIANCE_KEYS.filter((key) => single(params, key) === '1'),
    }),
    search: single(params, 'q'),
  };
}

export function parseDealParams(params: Params): DealFilters {
  const type = single(params, 'type');
  const state = single(params, 'state')?.toUpperCase();
  const brand = single(params, 'brand');
  const condition = single(params, 'condition');
  return {
    selection: compact({
      type: type && DEAL_TYPES.includes(type) ? [type] : [],
      state: state && STATE_CODE.test(state) ? [state] : [],
      brand: brand ? [brand] : [],
      condition: condition ? [condition] : [],
    }),
    search: single(params, 'q'),
  };
}

/** Drops values that only make sense together with another choice (e.g. wattage without panels). */
export function normalizeProductSelection(selection: FilterSelection): FilterSelection {
  const category = selection.category?.[0];
  return compact({
    ...selection,
    subcategory: category ? (selection.subcategory ?? []) : [],
    wattage: category === PANELS_CATEGORY_ID ? (selection.wattage ?? []) : [],
    sector: category === INVERTERS_CATEGORY_ID ? (selection.sector ?? []) : [],
  });
}

export function normalizeDealSelection(selection: FilterSelection): FilterSelection {
  const type = selection.type?.[0];
  return compact({
    ...selection,
    subcategory: type ? (selection.subcategory ?? []) : [],
    wattage: type === 'panels' ? (selection.wattage ?? []) : [],
    color: type === 'panels' ? (selection.color ?? []) : [],
    sector: type === 'inverters' ? (selection.sector ?? []) : [],
  });
}

export function countSelected(selection: FilterSelection | undefined): number {
  return Object.values(selection ?? {}).reduce((total, values) => total + values.length, 0);
}

export type ProductFilterData = {
  brands: BrandOption[];
  /** Sub-categories keyed by top-level category id. */
  subCategories: Record<string, FilterOption[]>;
  sectors: FilterOption[];
};

/** The product filter groups of sunhub.com's shop sidebar, shaped by what is currently chosen. */
export function productSections(data: ProductFilterData, draft: FilterSelection): FilterSection[] {
  const category = draft.category?.[0];
  const subCategories = category ? (data.subCategories[category] ?? []) : [];
  const sections: FilterSection[] = [
    { key: 'availability', title: 'Availability', options: AVAILABILITY_OPTIONS },
    {
      key: 'category',
      title: 'Main Category',
      options: HOME_CATEGORIES.map((entry) => ({
        value: String(entry.parentId),
        label: entry.name,
      })),
    },
  ];
  if (subCategories.length) {
    sections.push({
      key: 'subcategory',
      title: 'Sub Category',
      multiple: true,
      options: subCategories,
    });
  }
  if (category === PANELS_CATEGORY_ID) {
    sections.push({ key: 'wattage', title: 'Panel Wattage', options: WATTAGE_OPTIONS });
  }
  sections.push({
    key: 'condition',
    title: 'Condition',
    multiple: true,
    options: PRODUCT_CONDITION_OPTIONS,
  });
  if (category === INVERTERS_CATEGORY_ID && data.sectors.length) {
    sections.push({ key: 'sector', title: 'Sectors', multiple: true, options: data.sectors });
  }
  sections.push(
    { key: 'shipping', title: 'Shipping Type', multiple: true, options: SHIPPING_OPTIONS },
    { key: 'compliance', title: 'Compliance', multiple: true, options: COMPLIANCE_FILTER_OPTIONS },
    {
      key: 'brand',
      title: 'Brand',
      multiple: true,
      options: data.brands.map((brand) => ({ value: String(brand.id), label: brand.name })),
    },
  );
  return sections;
}

/** The deal filter groups of sunhub.com's trader sidebar, shaped by what is currently chosen. */
export function dealSections(options: DealFilterOptions, draft: FilterSelection): FilterSection[] {
  const type = draft.type?.[0];
  const subCategories = type ? (options.subCategories[type] ?? []) : [];
  const sections: FilterSection[] = [
    { key: 'availability', title: 'Availability', options: AVAILABILITY_OPTIONS },
    { key: 'type', title: 'Main Category', options: DEAL_TYPE_OPTIONS },
  ];
  if (subCategories.length) {
    sections.push({
      key: 'subcategory',
      title: 'Sub Category',
      multiple: true,
      options: subCategories,
    });
  }
  sections.push({ key: 'tier', title: 'Company Tier', options: TIER_OPTIONS });
  if (type === 'panels') {
    sections.push(
      { key: 'wattage', title: 'Panel Wattage', options: WATTAGE_OPTIONS },
      { key: 'color', title: 'Color', multiple: true, options: COLOR_OPTIONS },
    );
  }
  sections.push(
    { key: 'state', title: 'State', multiple: true, options: options.states },
    { key: 'incoterms', title: 'Incoterms', multiple: true, options: options.incoterms },
  );
  if (type === 'inverters' && options.sectors.length) {
    sections.push({ key: 'sector', title: 'Sectors', multiple: true, options: options.sectors });
  }
  sections.push(
    { key: 'condition', title: 'Condition', multiple: true, options: DEAL_CONDITION_OPTIONS },
    { key: 'compliance', title: 'Compliance', multiple: true, options: COMPLIANCE_FILTER_OPTIONS },
    { key: 'brand', title: 'Shop By Brands', multiple: true, options: options.brands },
  );
  return sections;
}
