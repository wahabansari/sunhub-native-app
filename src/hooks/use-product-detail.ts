import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { toUserMessage } from '@/errors';
import { getProduct } from '@/services/catalog/product-service';

export function useProductDetail(uuid: string) {
  const query = useQuery({
    queryKey: queryKeys.product(uuid),
    queryFn: () => getProduct(uuid),
  });

  return {
    product: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? toUserMessage(query.error) : null,
    retry: () => void query.refetch(),
  };
}
