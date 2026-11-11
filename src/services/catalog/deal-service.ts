import { API_ENDPOINTS } from '@/constants/api';
import type { HomeDeal } from '@/types/home';
import { DEAL_TYPE_CATEGORY_NAME } from '@/constants/listing-options';
import type {
  DealDetail,
  DealFilterOptions,
  DealFilters,
  FilterOption,
  ResultPage,
} from '@/types/listing';

import {
  isRecord,
  normalizeDeal,
  numberValue,
  normalizePickupStates,
  pageInfo,
  recordFrom,
  rowsFrom,
  stringValue,
} from './catalog-normalizers';
import { requestBroker } from './catalog-requests';
import { mapDealDetail } from './detail-mappers';
import { buildDealQuery } from './listing-queries';

const LISTING_ID = /^[A-Za-z0-9_-]{1,40}$/;

export async function searchDeals(
  filters: DealFilters,
  page: number,
): Promise<ResultPage<HomeDeal>> {
  const payload = await requestBroker(
    `${API_ENDPOINTS.broker.publicListings}?${buildDealQuery(filters, page)}`,
  );
  const items = rowsFrom(payload).map(normalizeDeal);
  return { items, ...pageInfo(payload, items.length) };
}

export async function getDeal(listingId: string): Promise<DealDetail | null> {
  if (!LISTING_ID.test(listingId)) return null;
  const payload = await requestBroker(
    API_ENDPOINTS.broker.listing.replace(':listingId', listingId),
  );
  const row = isRecord(payload) ? recordFrom(payload.data) : {};
  return Object.keys(row).length ? mapDealDetail(row) : null;
}

function names(block: unknown): string[] {
  const data = isRecord(block) && Array.isArray(block.data) ? block.data : [];
  return data.map((entry) => stringValue(entry)).filter(Boolean);
}

function countedList(block: unknown, key: string): { value: string; count: number }[] {
  const data = isRecord(block) && Array.isArray(block.data) ? block.data : [];
  return data
    .filter(isRecord)
    .map((entry) => ({ value: stringValue(entry[key]), count: numberValue(entry.count, 0) }))
    .filter((entry) => entry.value);
}

function subCategoryOptions(categories: unknown): Record<string, FilterOption[]> {
  const list = isRecord(categories) && isRecord(categories.data) ? categories.data.data : [];
  const result: Record<string, FilterOption[]> = {};
  for (const [type, categoryName] of Object.entries(DEAL_TYPE_CATEGORY_NAME)) {
    const parent = (Array.isArray(list) ? list : [])
      .filter(isRecord)
      .find((entry) => entry.name === categoryName);
    const children = parent && Array.isArray(parent.children) ? parent.children : [];
    result[type] = children
      .filter(isRecord)
      .map((child) => stringValue(child.name))
      .filter(Boolean)
      .map((name) => ({ value: name, label: name }));
  }
  return result;
}

/** Everything the deal filter sheet needs, read from the same broker sidebar the web trader page uses. */
export async function getDealFilterOptions(): Promise<DealFilterOptions> {
  const payload = await requestBroker(API_ENDPOINTS.broker.brokerSidebar);
  const data = isRecord(payload) ? recordFrom(payload.data) : {};

  return {
    states: normalizePickupStates(payload)
      .sort((a, b) => b.total - a.total)
      .map((state) => ({ value: state.code, label: state.code, count: state.total })),
    brands: names(data.brands)
      .sort((a, b) => a.localeCompare(b))
      .map((brand) => ({ value: brand, label: brand })),
    incoterms: countedList(data.incoterms, 'incoterm').map((entry) => ({
      value: entry.value.split(' - ')[0],
      label: entry.value,
      count: entry.count,
    })),
    sectors: countedList(data.inverter_sector_type, 'type').map((entry) => ({
      value: entry.value,
      label: entry.value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      count: entry.count,
    })),
    subCategories: subCategoryOptions(data.categories),
  };
}
