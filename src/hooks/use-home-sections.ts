import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { queryKeys } from '@/constants/query-keys';
import { toUserMessage } from '@/errors';
import {
  loadArticles,
  loadBrands,
  loadBuyDirectProducts,
  loadFeaturedDeals,
  loadPickupStates,
  loadRecentDeals,
  loadSpotlightDeals,
} from '@/services/home/home-service';
import { searchDeals } from '@/services/catalog/deal-service';
import { logger } from '@/services/logging';
import type { HomeDeal } from '@/types/home';
import type { ResultPage } from '@/types/listing';

export type SectionState<T> = {
  data: T | undefined;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
};

/** One independently cached, retried and reported home section. */
function useSection<T>(name: string, loader: () => Promise<T>, enabled = true): SectionState<T> {
  const query = useQuery<T, Error>({
    queryKey: [...queryKeys.home, name],
    enabled,
    queryFn: async () => {
      try {
        return await loader();
      } catch (error) {
        logger.warn('Home section failed to load', {
          section: name,
          message: error instanceof Error ? error.message : 'unknown error',
        });
        throw error;
      }
    },
  });

  return {
    data: query.data,
    isLoading: enabled && query.isPending,
    error: query.error ? toUserMessage(query.error) : null,
    retry: () => void query.refetch(),
  };
}

export const useFeaturedDeals = () => useSection('featured', loadFeaturedDeals);
export const useRecentDeals = () => useSection('recent', loadRecentDeals);
export const useSpotlightDeals = () => useSection('spotlight', loadSpotlightDeals);
export const usePickupStates = () => useSection('pickup', loadPickupStates);
export const useBuyDirectProducts = () => useSection('buy-direct', loadBuyDirectProducts);
export const useHomeBrands = () => useSection('brands', loadBrands);
/** Deals for the state picked in the local pickup section. */
export const usePickupDeals = (code: string | null): SectionState<ResultPage<HomeDeal>> =>
  useSection(
    `pickup-deals:${code ?? 'none'}`,
    () => searchDeals({ selection: { state: code ? [code] : [] } }, 1),
    code !== null,
  );
export const useHomeArticles = () => useSection('articles', loadArticles);

/** Pull-to-refresh: refetches every home section at once. */
export function useRefreshHome(): () => Promise<void> {
  const queryClient = useQueryClient();
  return useCallback(() => queryClient.refetchQueries({ queryKey: queryKeys.home }), [queryClient]);
}
