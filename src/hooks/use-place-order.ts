import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import { queryKeys } from '@/constants/query-keys';
import { toUserMessage } from '@/errors';
import { isAppError } from '@/errors/app-error';
import { cartService } from '@/services/cart';
import type { PlacedOrder } from '@/types/cart';

import { fetchFreshTotals, type TotalsInput } from './use-checkout-totals';

export const LAST_ORDER_KEY = ['checkout', 'last-order'] as const;

const TOTAL_TOLERANCE = 0.005;
const UNCERTAIN_MESSAGE =
  'We could not confirm whether your order went through. Please check your email for a confirmation before trying again, so you are not charged twice.';

/** A failure after which the order may or may not have been placed (the request never got an answer). */
function isUncertain(error: unknown): boolean {
  if (!isAppError(error)) return false;
  return (
    error.code === 'NETWORK' ||
    error.code === 'TIMEOUT' ||
    error.code === 'ABORTED' ||
    (error.status !== undefined && error.status >= 500)
  );
}

type State = { isPlacing: boolean; error: string | null; notice: string | null };

/**
 * Places the order exactly once per tap. Before anything is charged it recalculates the total on
 * the server and stops if it differs from the one the buyer was shown; if the connection drops
 * mid-order it never retries on its own, because the card may already have been charged.
 */
export function usePlaceOrder(input: TotalsInput, shownTotal: number | undefined) {
  const client = useQueryClient();
  const router = useRouter();
  const lock = useRef(false);
  const [state, setState] = useState<State>({ isPlacing: false, error: null, notice: null });

  const finish = (order: PlacedOrder) => {
    client.setQueryData(LAST_ORDER_KEY, order);
    void client.invalidateQueries({ queryKey: queryKeys.cart });
    router.replace('/order-confirmation');
  };

  const place = async (execute: () => Promise<PlacedOrder>) => {
    if (lock.current) return;
    lock.current = true;
    setState({ isPlacing: true, error: null, notice: null });

    try {
      const fresh = await fetchFreshTotals(client, input);
      if (shownTotal === undefined || Math.abs(fresh.total - shownTotal) > TOTAL_TOLERANCE) {
        setState({
          isPlacing: false,
          error: null,
          notice: 'Your total was updated. Review it and tap Place order again.',
        });
        return;
      }

      finish(await execute());
    } catch (error) {
      if (isUncertain(error)) {
        // If the server already emptied the cart, the order went through.
        const cart = await cartService.getCart().catch(() => null);
        if (cart && cart.itemCount === 0) {
          finish({});
          return;
        }
        setState({ isPlacing: false, error: UNCERTAIN_MESSAGE, notice: null });
        return;
      }
      setState({ isPlacing: false, error: toUserMessage(error), notice: null });
    } finally {
      lock.current = false;
    }
  };

  return {
    ...state,
    place,
    clearMessages: () => setState((s) => ({ ...s, error: null, notice: null })),
  };
}
