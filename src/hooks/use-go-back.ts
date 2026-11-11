import { useRouter } from 'expo-router';
import { useCallback } from 'react';

/** Goes back when there is history, otherwise returns to the home screen (deep links, cold starts). */
export function useGoBack(): () => void {
  const router = useRouter();
  return useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [router]);
}
