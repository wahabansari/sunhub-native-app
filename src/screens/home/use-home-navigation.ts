import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Linking } from 'react-native';

import { showComingSoon } from '@/components/feedback/notices';
import { useAuth } from '@/hooks/use-auth';
import { useAddToCart } from '@/hooks/use-cart';
import { useRequireAuth } from '@/hooks/use-require-auth';
import type { QUICK_ACTIONS } from '@/constants/home-content';
import type { HomeArticle, HomeBrand, HomeCategory, HomeDeal, HomeProduct } from '@/types/home';

const BLOG_URL = 'https://www.sunhub.com/blog';

type QuickActionId = (typeof QUICK_ACTIONS)[number]['id'];

function openExternal(url: string): void {
  if (/^https:\/\//i.test(url)) void Linking.openURL(url);
}

/** Every tappable element on the home screen resolves to a route (or an explicit notice) here. */
export function useHomeNavigation(scrollToPickup: () => void) {
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const { add } = useAddToCart();
  const { state } = useAuth();
  const isSignedIn = state.status === 'authenticated';

  return useMemo(
    () => ({
      openSearch: () => router.push('/search'),
      openShop: () => router.push('/shop'),
      openDeals: () => router.push('/deals'),
      openProducts: () => router.push('/products'),
      openDeal: (deal: HomeDeal) => router.push(`/deals/${deal.id}`),
      openProduct: (product: HomeProduct) => router.push(`/products/${product.id}`),
      openCategory: (category: HomeCategory) =>
        router.push({ pathname: '/products', params: { category: String(category.parentId) } }),
      openBrand: (brand: HomeBrand) =>
        router.push({ pathname: '/products', params: { brand: brand.id } }),
      openState: (code: string) => router.push({ pathname: '/deals', params: { state: code } }),
      openArticle: (article: HomeArticle) => openExternal(article.url ?? BLOG_URL),
      openBlog: () => openExternal(BLOG_URL),
      quickAction: (id: QuickActionId) => {
        if (id === 'trader') router.push('/deals');
        else if (id === 'direct') router.push('/products');
        else if (id === 'pickup') scrollToPickup();
        else showComingSoon('Calculators');
      },
      openProfile: () => router.push(isSignedIn ? '/account' : '/login'),
      chat: () => requireAuth('Chat'),
      openCart: () => router.push('/cart'),
      addToCart: (product: HomeProduct) =>
        add(product.id, product.moq ?? 1, { moq: product.moq, stock: product.stock }),
      comingSoon: showComingSoon,
    }),
    [add, isSignedIn, router, requireAuth, scrollToPickup],
  );
}
