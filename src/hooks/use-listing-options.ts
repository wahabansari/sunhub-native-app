import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { HOME_CATEGORIES } from '@/constants/home-content';
import { queryKeys } from '@/constants/query-keys';
import { getDealFilterOptions } from '@/services/catalog/deal-service';
import {
  countProducts,
  listBrands,
  listSectors,
  listSubCategories,
} from '@/services/catalog/product-service';
import type { DealFilterOptions, FilterOption } from '@/types/listing';
import type { ProductFilterData } from '@/utils/listing-filters';

const OPTIONS_STALE_MS = 30 * 60 * 1000;
const EMPTY_DEAL_OPTIONS: DealFilterOptions = {
  states: [],
  brands: [],
  incoterms: [],
  sectors: [],
  subCategories: {},
};

export function useDealFilterOptions(): DealFilterOptions {
  const query = useQuery({
    queryKey: queryKeys.dealOptions,
    queryFn: getDealFilterOptions,
    staleTime: OPTIONS_STALE_MS,
  });
  return query.data ?? EMPTY_DEAL_OPTIONS;
}

/** Brands, per-category sub-categories and sectors for the product filter sheet. */
export function useProductFilterData(): ProductFilterData {
  const brands = useQuery({
    queryKey: queryKeys.brands({ scope: 'filter' }),
    queryFn: listBrands,
    staleTime: OPTIONS_STALE_MS,
  });
  const sectors = useQuery({
    queryKey: ['catalog', 'sectors'],
    queryFn: listSectors,
    staleTime: OPTIONS_STALE_MS,
  });
  const subCategories = useQueries({
    queries: HOME_CATEGORIES.map((category) => ({
      queryKey: ['catalog', 'sub-categories', category.parentId],
      queryFn: () => listSubCategories(category.parentId),
      staleTime: OPTIONS_STALE_MS,
    })),
    combine: combineSubCategories,
  });

  const brandData = brands.data;
  const sectorData = sectors.data;

  return useMemo(
    () => ({ brands: brandData ?? [], sectors: sectorData ?? [], subCategories }),
    [brandData, sectorData, subCategories],
  );
}

function combineSubCategories(
  results: { data: FilterOption[] | undefined }[],
): Record<string, FilterOption[]> {
  const byCategory: Record<string, FilterOption[]> = {};
  results.forEach((result, index) => {
    byCategory[String(HOME_CATEGORIES[index].parentId)] = result.data ?? [];
  });
  return byCategory;
}

/** Product counts per top-level category, keyed by category id; missing until loaded. */
export function useCategoryCounts(): Record<number, number> {
  const results = useQueries({
    queries: HOME_CATEGORIES.map((category) => ({
      queryKey: queryKeys.categoryCount(category.parentId),
      queryFn: () => countProducts(category.parentId),
      staleTime: OPTIONS_STALE_MS,
    })),
  });
  const counts: Record<number, number> = {};
  results.forEach((result, index) => {
    if (result.data !== undefined) counts[HOME_CATEGORIES[index].parentId] = result.data;
  });
  return counts;
}
