import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { queryKeys } from '@/constants/query-keys';
import { useAuth } from '@/hooks/use-auth';
import { cartService } from '@/services/cart';
import { logger } from '@/services/logging';

/**
 * Signing out also discards every cached per-user list (account, saved profile, checkout) so the
 * next person on this device never sees the previous user's data.
 *
 * When a buyer signs in, items they added as a guest move into their account cart, then every
 * cart view refreshes. Renders nothing.
 */
export function CartSync() {
  const { state } = useAuth();
  const client = useQueryClient();
  const signedIn = state.status === 'authenticated';

  useEffect(() => {
    if (!signedIn) {
      client.removeQueries({ queryKey: ['account'] });
      client.removeQueries({ queryKey: ['profile'] });
      client.removeQueries({ queryKey: ['checkout'] });
      void client.invalidateQueries({ queryKey: queryKeys.cart });
      return undefined;
    }

    let cancelled = false;
    cartService
      .mergeGuestCart()
      .catch((error: unknown) => {
        logger.warn('Guest cart merge failed', {
          message: error instanceof Error ? error.message : 'unknown error',
        });
      })
      .finally(() => {
        if (!cancelled) void client.invalidateQueries({ queryKey: queryKeys.cart });
      });

    return () => {
      cancelled = true;
    };
  }, [client, signedIn]);

  return null;
}
