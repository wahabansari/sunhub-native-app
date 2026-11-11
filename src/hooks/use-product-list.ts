import { useInfiniteQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { toUserMessage } from '@/errors';
import { searchProducts } from '@/services/catalog/product-service';
import type { ProductFilters } from '@/types/listing';

export function useProductList(filters: ProductFilters, enabled = true) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.products(filters),
    queryFn: ({ pageParam }) => searchProducts(filters, pageParam),
    enabled,
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });

  return {
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
    total: query.data?.pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching && !query.isFetchingNextPage,
    isLoadingMore: query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    error: query.error ? toUserMessage(query.error) : null,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
    },
    refresh: () => void query.refetch(),
  };
}
