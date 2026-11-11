import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';

import { safeRedirect } from '@/utils/auth-links';

export type AuthRoute = '/login' | '/register' | '/forgot-password' | '/reset-password';

/**
 * Reads the screen to return to after signing in (`?redirect=/products/…`) and moves between auth
 * screens without losing it. The value is validated, so it can only ever be an in-app path.
 */
export function useAuthRedirect() {
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect?: string }>();
  const redirect = safeRedirect(params.redirect);

  const goTo = useCallback(
    (route: AuthRoute, extra: Record<string, string> = {}) => {
      router.replace({
        pathname: route,
        params: { ...(redirect ? { redirect } : {}), ...extra },
      });
    },
    [redirect, router],
  );

  return { redirect, destination: redirect ?? '/', goTo };
}
