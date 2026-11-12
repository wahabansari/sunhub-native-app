import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { toUserMessage } from '@/errors';
import { accountDataService } from '@/services/account';
import type { AccountPage, PasswordChange } from '@/types/account';

type Fetcher<T> = (page: number) => Promise<AccountPage<T>>;

/** A paged list that belongs to the signed-in user, loaded a page at a time. */
function useAccountList<T>(key: string, fetchPage: Fetcher<T>, enabled: boolean) {
  const query = useInfiniteQuery({
    queryKey: ['account', key],
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    enabled,
  });

  return {
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
    total: query.data?.pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching && !query.isFetchingNextPage,
    isLoadingMore: query.isFetchingNextPage,
    error: query.error ? toUserMessage(query.error) : null,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
    },
    refresh: () => void query.refetch(),
  };
}

export const useOrders = (enabled = true) =>
  useAccountList('orders', (page) => accountDataService.listOrders(page), enabled);

export const useMyListings = (enabled = true) =>
  useAccountList('listings', (page) => accountDataService.listMyListings(page), enabled);

export const useSoldItems = (enabled = true) =>
  useAccountList('sold', (page) => accountDataService.listSoldItems(page), enabled);

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: PasswordChange) => accountDataService.changePassword(input),
  });
}

export function useDeleteAddress() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountDataService.deleteAddress(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['profile', 'addresses'] }),
  });
}

export function useDeleteCard() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountDataService.deleteCard(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['profile', 'cards'] }),
  });
}
