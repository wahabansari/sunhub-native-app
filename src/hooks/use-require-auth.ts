import { usePathname, useRouter } from 'expo-router';
import { useCallback } from 'react';

import { showComingSoon } from '@/components/feedback/notices';
import { useAuth } from '@/hooks/use-auth';

/**
 * Gate for actions that need an account. Signed-in users run `onAllowed` (or see the feature's
 * coming-soon notice while it is not built); everyone else is sent to the login screen, which
 * brings them back to this screen afterwards.
 */
export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useAuth();
  const isSignedIn = state.status === 'authenticated';

  return useCallback(
    (feature: string, onAllowed?: () => void) => {
      if (isSignedIn) {
        if (onAllowed) onAllowed();
        else showComingSoon(feature);
        return;
      }

      router.push({ pathname: '/login', params: { redirect: pathname } });
    },
    [isSignedIn, pathname, router],
  );
}
