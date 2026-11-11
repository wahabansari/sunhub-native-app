import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useToast } from '@/components/feedback/toast';
import { queryKeys } from '@/constants/query-keys';
import { toUserMessage } from '@/errors';
import { useAuth } from '@/hooks/use-auth';
import { cartService } from '@/services/cart';
import { clampQuantity } from '@/services/cart/cart-mappers';
import type { Cart } from '@/types/cart';

const CART_STALE_MS = 30_000;

/** The cart belongs to the account when signed in and to this device otherwise; they are cached apart. */
export function useCartKey() {
  const { state } = useAuth();
  return [...queryKeys.cart, state.status === 'authenticated' ? 'account' : 'guest'] as const;
}

export function useCart() {
  const { state } = useAuth();
  const key = useCartKey();
  const query = useQuery({
    queryKey: key,
    queryFn: () => cartService.getCart(),
    enabled: state.status !== 'initializing',
    staleTime: CART_STALE_MS,
  });

  return {
    cart: query.data,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    error: query.error ? toUserMessage(query.error) : null,
    refetch: () => void query.refetch(),
  };
}

export function useCartCount(): number {
  return useCart().cart?.itemCount ?? 0;
}

type Limits = { moq?: number; stock?: number };

/** Adds an item to the cart (guest or signed in) and confirms with a toast. */
export function useAddToCart() {
  const client = useQueryClient();
  const toast = useToast();
  const key = useCartKey();

  const mutation = useMutation({
    mutationFn: ({ uuid, qty, moq, stock }: { uuid: string; qty: number } & Limits) =>
      cartService.addItem(uuid, qty, { moq: moq ?? 1, stock: stock ?? Number.MAX_SAFE_INTEGER }),
    onSuccess: () => toast.show('Added to cart'),
    onError: (error) => toast.show(toUserMessage(error), 'error'),
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  });

  return {
    isAdding: mutation.isPending,
    add: useCallback(
      (uuid: string, qty: number, limits: Limits = {}) =>
        mutation.mutate({ uuid, qty: Math.max(qty, limits.moq ?? 1), ...limits }),
      [mutation],
    ),
  };
}

function withQuantity(cart: Cart, uuid: string, qty: number): Cart {
  const items = cart.items.map((item) =>
    item.uuid === uuid
      ? { ...item, qty, lineTotal: Math.round(item.unitPrice * qty * 100) / 100 }
      : item,
  );
  const available = items.filter((item) => !item.outOfStock);
  return {
    ...cart,
    items,
    subtotal: Math.round(available.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100,
  };
}

/** Quantity, remove and clear, with the list updating instantly and rolling back if the server refuses. */
export function useCartActions() {
  const client = useQueryClient();
  const toast = useToast();
  const key = useCartKey();

  const optimistic = async (update: (cart: Cart) => Cart) => {
    await client.cancelQueries({ queryKey: key });
    const previous = client.getQueryData<Cart>(key);
    if (previous) client.setQueryData(key, update(previous));
    return { previous };
  };
  const rollback = (error: unknown, _vars: unknown, context?: { previous?: Cart }) => {
    if (context?.previous) client.setQueryData(key, context.previous);
    toast.show(toUserMessage(error), 'error');
  };
  const settle = () => client.invalidateQueries({ queryKey: key });

  const setQuantity = useMutation({
    mutationFn: ({ uuid, qty }: { uuid: string; qty: number }) =>
      cartService.setQuantity(uuid, qty),
    onMutate: ({ uuid, qty }) => optimistic((cart) => withQuantity(cart, uuid, qty)),
    onError: rollback,
    onSettled: settle,
  });

  const remove = useMutation({
    mutationFn: (uuid: string) => cartService.removeItem(uuid),
    onMutate: (uuid) =>
      optimistic((cart) => {
        const items = cart.items.filter((item) => item.uuid !== uuid);
        const available = items.filter((item) => !item.outOfStock);
        return {
          items,
          itemCount: items.length,
          hasOutOfStock: items.length > available.length,
          subtotal: available.reduce((sum, item) => sum + item.lineTotal, 0),
        };
      }),
    onError: rollback,
    onSettled: settle,
  });

  const clear = useMutation({
    mutationFn: () => cartService.clear(),
    onMutate: () =>
      optimistic(() => ({ items: [], itemCount: 0, subtotal: 0, hasOutOfStock: false })),
    onError: rollback,
    onSettled: settle,
  });

  return {
    changeQuantity: (uuid: string, qty: number, moq: number, stock: number) =>
      setQuantity.mutate({ uuid, qty: clampQuantity(qty, moq, stock) }),
    removeItem: (uuid: string) => remove.mutate(uuid),
    clearCart: () => clear.mutate(),
  };
}
