import { API_ENDPOINTS } from '@/constants/api';
import type { HomeProduct } from '@/types/home';
import type {
  BrandOption,
  FilterOption,
  ProductDetail,
  ProductFilters,
  ResultPage,
} from '@/types/listing';

import {
  isRecord,
  normalizeProduct,
  numberValue,
  pageInfo,
  rowsFrom,
  stringValue,
} from './catalog-normalizers';
import { requestMainGet, requestMainRaw } from './catalog-requests';
import { mapProductDetail } from './detail-mappers';
import { PRODUCT_DETAIL_FIELDS, buildProductBody } from './listing-queries';

const ITEM_ID = /^[A-Za-z0-9_-]{1,40}$/;
const BRAND_LIMIT = 300;
const EMPTY_FILTERS: ProductFilters = {};

export async function searchProducts(
  filters: ProductFilters,
  page: number,
): Promise<ResultPage<HomeProduct>> {
  const payload = await requestMainRaw(
    API_ENDPOINTS.catalog.productsSearch,
    buildProductBody(filters, page),
  );
  const items = rowsFrom(payload).map(normalizeProduct);
  return { items, ...pageInfo(payload, items.length) };
}

export async function countProducts(categoryId: number): Promise<number> {
  const payload = await requestMainRaw(
    API_ENDPOINTS.catalog.productsSearch,
    buildProductBody({ selection: { category: [String(categoryId)] } }, 1, 1, ['id']),
  );
  return pageInfo(payload, 0).total;
}

export async function getProduct(uuid: string): Promise<ProductDetail | null> {
  if (!ITEM_ID.test(uuid)) return null;
  const body = {
    ...buildProductBody(EMPTY_FILTERS, 1, 1, PRODUCT_DETAIL_FIELDS),
    where: [['uuid', uuid]],
  };
  const payload = await requestMainRaw(API_ENDPOINTS.catalog.productsSearch, body);
  const row = rowsFrom(payload)[0];
  return row ? mapProductDetail(row) : null;
}

export async function listBrands(): Promise<BrandOption[]> {
  const payload = await requestMainRaw(API_ENDPOINTS.catalog.brandsSearch, {
    fields: ['id', 'name'],
    limit: BRAND_LIMIT,
  });
  return rowsFrom(payload)
    .filter((row) => isRecord(row) && numberValue(row.id, 0) > 0 && stringValue(row.name))
    .map((row) => ({ id: numberValue(row.id), name: stringValue(row.name) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Sub-categories of one top-level category, in catalog order. */
export async function listSubCategories(parentId: number): Promise<FilterOption[]> {
  const payload = await requestMainRaw(API_ENDPOINTS.catalog.categoriesSearch, {
    fields: ['id', 'name', 'is_active'],
    where: [['parent_id', parentId]],
    limit: 80,
  });
  return rowsFrom(payload)
    .filter((row) => numberValue(row.id, 0) > 0 && stringValue(row.name) && row.is_active !== 0)
    .map((row) => ({ value: String(numberValue(row.id)), label: stringValue(row.name) }));
}

/** Inverter sectors (Residential, Commercial, ...) with their listing counts. */
export async function listSectors(): Promise<FilterOption[]> {
  const payload = await requestMainGet(API_ENDPOINTS.content.sectors);
  const rows = Array.isArray(payload) ? payload : [];
  return rows
    .filter(isRecord)
    .filter((row) => stringValue(row.name) && numberValue(row.count, 0) > 0)
    .map((row) => ({
      value: stringValue(row.name),
      label: stringValue(row.name),
      count: numberValue(row.count, 0),
    }));
}
