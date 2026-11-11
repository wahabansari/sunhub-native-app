import { useRouter } from 'expo-router';

import type { HeaderAction } from '@/components/listing/listing-header';
import { useCartCount } from '@/hooks/use-cart';

/** The header's cart button: opens the cart and shows how many items are in it. */
export function useCartAction(): HeaderAction {
  const router = useRouter();
  const count = useCartCount();
  return { icon: 'cart', label: 'Cart', badge: count, onPress: () => router.push('/cart') };
}
