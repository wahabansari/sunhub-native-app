import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArticlesSection } from '@/components/home/articles-section';
import { BrandsRow } from '@/components/home/brands-row';
import { BuyDirectSection } from '@/components/home/buy-direct-section';
import { CategoriesRow } from '@/components/home/categories-row';
import { FeaturedDealsSection } from '@/components/home/featured-deals-section';
import { GrowSection } from '@/components/home/grow-section';
import { HeroPromo } from '@/components/home/hero-promo';
import { HomeHeader } from '@/components/home/home-header';
import { PickupMapSection } from '@/components/home/pickup-map-section';
import { QuickActions } from '@/components/home/quick-actions';
import { RecentDealsSection } from '@/components/home/recent-deals-section';
import { ReviewsSection } from '@/components/home/reviews-section';
import { SearchBar } from '@/components/home/search-bar';
import { SpotlightSection } from '@/components/home/spotlight-section';
import { Reveal } from '@/components/motion/reveal';
import { useAppReady } from '@/contexts/app-ready/app-ready-context';
import {
  useBuyDirectProducts,
  useFeaturedDeals,
  useHomeArticles,
  useHomeBrands,
  usePickupStates,
  useRecentDeals,
  useRefreshHome,
  useSpotlightDeals,
} from '@/hooks/use-home-sections';
import { colors } from '@/theme/tokens';

import { useHomeNavigation } from './use-home-navigation';

const BOTTOM_BREATHING_ROOM = 16;

export function HomeScreen() {
  const { homeActive, reportHomeReady } = useAppReady();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const pickupY = useRef(0);
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const refreshHome = useRefreshHome();
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const scrollToPickup = useCallback(() => {
    scrollRef.current?.scrollTo({ y: Math.max(0, pickupY.current - 8), animated: true });
  }, []);
  const go = useHomeNavigation(scrollToPickup);

  const featured = useFeaturedDeals();
  const pickup = usePickupStates();
  const buyDirect = useBuyDirectProducts();
  const recent = useRecentDeals();
  const spotlight = useSpotlightDeals();
  const brands = useHomeBrands();
  const articles = useHomeArticles();

  // The page paints immediately and every section loads on its own, so the splash never waits on the network.
  useEffect(() => {
    reportHomeReady();
  }, [reportHomeReady]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshHome();
    } finally {
      setRefreshing(false);
    }
  }, [refreshHome]);

  if (!homeActive) return <View className="flex-1 bg-white" />;

  return (
    <View className="flex-1 bg-white">
      <HomeHeader
        scrollY={scrollY}
        onProfile={go.openProfile}
        onNotifications={() => go.comingSoon('Notifications')}
        onCart={() => go.comingSoon('Cart')}
      />
      <Animated.ScrollView
        ref={scrollRef}
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + BOTTOM_BREATHING_ROOM }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Reveal index={0}>
          <SearchBar onPress={go.openSearch} onFilters={go.openSearch} />
        </Reveal>
        <Reveal index={1}>
          <HeroPromo onShopNow={go.openShop} />
        </Reveal>
        <Reveal index={2}>
          <QuickActions onPress={go.quickAction} />
        </Reveal>
        <Reveal index={3}>
          <CategoriesRow onSelect={go.openCategory} onSeeAll={go.openShop} />
        </Reveal>
        <Reveal index={4}>
          <FeaturedDealsSection state={featured} onSeeAll={go.openDeals} onSelect={go.openDeal} />
        </Reveal>
        <Reveal index={5}>
          <View
            onLayout={(event: LayoutChangeEvent) => {
              pickupY.current = event.nativeEvent.layout.y;
            }}
          >
            <PickupMapSection
              state={pickup}
              onSeeAll={go.openDeals}
              onOpenState={go.openState}
              onOpenDeal={go.openDeal}
            />
          </View>
        </Reveal>
        <Reveal index={6}>
          <BuyDirectSection
            state={buyDirect}
            onSeeAll={go.openProducts}
            onSelect={go.openProduct}
            onAdd={go.addToCart}
          />
        </Reveal>
        <Reveal index={6}>
          <RecentDealsSection state={recent} onSeeAll={go.openDeals} onSelect={go.openDeal} />
        </Reveal>
        <Reveal index={6}>
          <SpotlightSection
            state={spotlight}
            fallback={featured.data?.slice(0, 3)}
            onChat={go.chat}
            onViewDetails={go.openDeal}
          />
        </Reveal>
        <Reveal index={6}>
          <BrandsRow state={brands} onSelect={go.openBrand} onSeeAll={go.openProducts} />
        </Reveal>
        <Reveal index={6}>
          <GrowSection
            onExplore={() => go.comingSoon('Advertising program')}
            onJoin={() => go.comingSoon('Join Sunhub')}
          />
        </Reveal>
        <Reveal index={6}>
          <ReviewsSection onViewAll={() => go.comingSoon('Reviews')} />
        </Reveal>
        <Reveal index={6}>
          <ArticlesSection state={articles} onSelect={go.openArticle} onGoToBlog={go.openBlog} />
        </Reveal>
      </Animated.ScrollView>
    </View>
  );
}
