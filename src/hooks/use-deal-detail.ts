import { useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { toUserMessage } from '@/errors';
import { getDeal } from '@/services/catalog/deal-service';
import type { HomeDeal } from '@/types/home';
import type { DealDetail } from '@/types/listing';
import { findCachedItem } from '@/utils/cached-items';

const isDeal = (value: unknown): value is HomeDeal =>
  typeof value === 'object' && value !== null && 'pricePerWatt' in value;

/** What a list card already knows, shaped as a detail record until the real one arrives. */
function summaryOf(deal: HomeDeal): DealDetail {
  return {
    id: deal.id,
    name: deal.name,
    brand: deal.brand,
    category: deal.category,
    perWatt: deal.perWatt,
    price: deal.pricePerWatt,
    compareAt: deal.compareAt,
    imageUrls: deal.imageUrl ? [deal.imageUrl] : [],
    location: deal.location ?? '',
    moq: deal.moq ?? '',
    shipping: deal.shipping,
    sponsored: Boolean(deal.sponsored),
    badges: deal.badges,
    specs: [],
    documents: [],
  };
}

export function useDealDetail(listingId: string) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.deal(listingId),
    queryFn: () => getDeal(listingId),
    placeholderData: () => {
      const cached = findCachedItem(client, [['listings'], ['home']], listingId, isDeal);
      return cached ? summaryOf(cached) : undefined;
    },
  });

  return {
    deal: query.data ?? null,
    isPlaceholder: query.isPlaceholderData,
    isLoading: query.isLoading,
    error: query.error ? toUserMessage(query.error) : null,
    retry: () => void query.refetch(),
  };
}
