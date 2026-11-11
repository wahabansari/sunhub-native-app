import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { queryKeys } from '@/constants/query-keys';
import { getDealFilterOptions, searchDeals } from '@/services/catalog/deal-service';
import { searchProducts } from '@/services/catalog/product-service';
import { parseDealParams, parseProductParams } from '@/utils/listing-filters';

const PREFETCH_DELAY_MS = 600;
const OPTIONS_STALE_MS = 30 * 60 * 1000;

/**
 * Once the home page has its first content, quietly loads the unfiltered product and deal lists
 * (and the deal filter options), so opening "See all" or Filters shows data instead of a skeleton.
 */
export function usePrefetchListings(ready: boolean): void {
  const client = useQueryClient();

  useEffect(() => {
    if (!ready) return undefined;

    const timer = setTimeout(() => {
      const products = parseProductParams({});
      const deals = parseDealParams({});

      void client.prefetchInfiniteQuery({
        queryKey: queryKeys.products(products),
        queryFn: ({ pageParam }) => searchProducts(products, pageParam),
        initialPageParam: 1,
      });
      void client.prefetchInfiniteQuery({
        queryKey: queryKeys.listings(deals),
        queryFn: ({ pageParam }) => searchDeals(deals, pageParam),
        initialPageParam: 1,
      });
      void client.prefetchQuery({
        queryKey: queryKeys.dealOptions,
        queryFn: getDealFilterOptions,
        staleTime: OPTIONS_STALE_MS,
      });
    }, PREFETCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [client, ready]);
}
