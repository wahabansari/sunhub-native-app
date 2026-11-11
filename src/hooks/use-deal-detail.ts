import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { toUserMessage } from '@/errors';
import { getDeal } from '@/services/catalog/deal-service';

export function useDealDetail(listingId: string) {
  const query = useQuery({
    queryKey: queryKeys.deal(listingId),
    queryFn: () => getDeal(listingId),
  });

  return {
    deal: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? toUserMessage(query.error) : null,
    retry: () => void query.refetch(),
  };
}
