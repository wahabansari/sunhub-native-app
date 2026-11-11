import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toUserMessage } from '@/errors';
import { checkoutService } from '@/services/cart';
import type { BillingAddress, CardToken } from '@/services/cart';
import type { ShippingAddress } from '@/types/cart';

const ADDRESSES_KEY = ['profile', 'addresses'] as const;
const CARDS_KEY = ['profile', 'cards'] as const;

/** The signed-in buyer's saved addresses and cards; disabled for guests. */
export function useSavedProfile(enabled: boolean) {
  const addresses = useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: () => checkoutService.listAddresses(),
    enabled,
  });
  const cards = useQuery({
    queryKey: CARDS_KEY,
    queryFn: () => checkoutService.listCards(),
    enabled,
  });

  return {
    addresses: addresses.data ?? [],
    cards: cards.data ?? [],
    isLoading: addresses.isLoading || cards.isLoading,
    error: addresses.error || cards.error ? toUserMessage(addresses.error ?? cards.error) : null,
  };
}

export function useAddAddress() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: ShippingAddress & { name: string; phone: string; email: string }) =>
      checkoutService.addAddress(input),
    onSuccess: () => client.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  });
}

export function useAddCard() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ token, billing }: { token: CardToken; billing: BillingAddress }) =>
      checkoutService.addCard(token, billing),
    onSuccess: () => client.invalidateQueries({ queryKey: CARDS_KEY }),
  });
}
