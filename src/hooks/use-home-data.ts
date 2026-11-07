import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';

import { toUserMessage } from '@/errors';
import { loadHomeData } from '@/services/home/home-service';
import type { HomeData } from '@/types/home';

export const homeQueryKey = [...queryKeys.home, 'data'] as const;

export function useHomeData() {
  const query = useQuery<HomeData, Error>({
    queryKey: homeQueryKey,
    queryFn: loadHomeData,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? toUserMessage(query.error) : null,
    reload: query.refetch,
  };
}
