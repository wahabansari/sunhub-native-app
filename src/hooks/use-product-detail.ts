import { useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { toUserMessage } from '@/errors';
import { getProduct } from '@/services/catalog/product-service';
import type { HomeProduct } from '@/types/home';
import type { ProductDetail } from '@/types/listing';
import { findCachedItem } from '@/utils/cached-items';

const isProduct = (value: unknown): value is HomeProduct =>
  typeof value === 'object' && value !== null && 'price' in value && 'unit' in value;

/** What a list card already knows, shaped as a detail record until the real one arrives. */
function summaryOf(product: HomeProduct): ProductDetail {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: product.price,
    unit: product.unit,
    stock: product.stock ?? 0,
    moq: 1,
    imageUrls: product.imageUrl ? [product.imageUrl] : [],
    sponsorLabel: product.sponsorLabel,
    badges: product.badges,
    shippingLabel: product.shippingLabel ?? '',
    specs: [],
  };
}

export function useProductDetail(uuid: string) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.product(uuid),
    queryFn: () => getProduct(uuid),
    placeholderData: () => {
      const cached = findCachedItem(client, [['products'], ['home']], uuid, isProduct);
      return cached ? summaryOf(cached) : undefined;
    },
  });

  return {
    product: query.data ?? null,
    isPlaceholder: query.isPlaceholderData,
    isLoading: query.isLoading,
    error: query.error ? toUserMessage(query.error) : null,
    retry: () => void query.refetch(),
  };
}
