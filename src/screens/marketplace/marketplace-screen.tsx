import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ListingHeader } from '@/components/listing/listing-header';
import { ModeBar } from '@/components/listing/mode-bar';
import { useCartAction } from '@/hooks/use-cart-action';
import { useGoBack } from '@/hooks/use-go-back';
import type { ListingMode } from '@/types/listing';

import { useDealsPane } from './use-deals-pane';
import { useProductsPane } from './use-products-pane';

/**
 * One page for both Buy now and Negotiable: switching only slides the selector and swaps the
 * header title and results (each mode keeps its own filters), so there is no page transition.
 */
export function MarketplaceScreen({ initialMode }: { initialMode: ListingMode }) {
  const router = useRouter();
  const goBack = useGoBack();
  const cartAction = useCartAction();
  const params = useLocalSearchParams();
  const [mode, setMode] = useState<ListingMode>(initialMode);
  const products = useProductsPane(params, mode === 'buy');
  const deals = useDealsPane(params, mode === 'negotiable');
  const pane = mode === 'buy' ? products : deals;

  return (
    <View className="flex-1 bg-white">
      <ListingHeader
        title={pane.isLoading ? null : pane.title}
        onBack={goBack}
        actions={[
          { icon: 'search', label: 'Search', onPress: () => router.push('/search') },
          cartAction,
        ]}
      />
      <ModeBar
        mode={mode}
        onModeChange={setMode}
        activeFilterCount={pane.filterCount}
        onOpenFilters={pane.openFilters}
      />
      <View key={mode} className="flex-1">
        {pane.grid}
      </View>
      {pane.sheet}
    </View>
  );
}
