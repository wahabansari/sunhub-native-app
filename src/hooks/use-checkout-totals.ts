import { keepPreviousData, useQuery, type QueryClient } from '@tanstack/react-query';

import { toUserMessage } from '@/errors';
import { checkoutService } from '@/services/cart';
import type { ShippingAddress } from '@/types/cart';

export type TotalsInput = {
  productTotal: number;
  address: ShippingAddress | null;
  fedexCharges: number;
};

const totalsKey = ({ productTotal, address, fedexCharges }: TotalsInput) =>
  ['checkout', 'totals', productTotal, address, fedexCharges] as const;

const totalsFn = ({ productTotal, address, fedexCharges }: TotalsInput) =>
  checkoutService.calculateTotals({
    productTotal,
    address: address ?? undefined,
    fedexCharges,
  });

/**
 * Shipping, tax, fee and total as the server calculates them. The product total sent comes from
 * the server's own cart, never from anything the buyer typed.
 */
export function useCheckoutTotals(input: TotalsInput, enabled: boolean) {
  const query = useQuery({
    queryKey: totalsKey(input),
    queryFn: () => totalsFn(input),
    enabled,
    staleTime: 0,
    gcTime: 60_000,
    placeholderData: keepPreviousData,
  });

  return {
    totals: query.data,
    isCalculating: query.isFetching,
    error: query.error ? toUserMessage(query.error) : null,
    retry: () => void query.refetch(),
  };
}

/** A fresh calculation, used right before an order is placed to confirm the total the buyer saw. */
export function fetchFreshTotals(client: QueryClient, input: TotalsInput) {
  return client.fetchQuery({
    queryKey: totalsKey(input),
    queryFn: () => totalsFn(input),
    staleTime: 0,
  });
}
