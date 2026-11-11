import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { DealGridCard } from '@/components/catalog/deal-grid-card';
import { showComingSoon } from '@/components/feedback/notices';
import { FilterSheet } from '@/components/listing/filter-sheet';
import { ListingHeader } from '@/components/listing/listing-header';
import { ModeBar } from '@/components/listing/mode-bar';
import { ResultGrid } from '@/components/listing/result-grid';
import { useDealList } from '@/hooks/use-deal-list';
import { useGoBack } from '@/hooks/use-go-back';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useDealFilterOptions } from '@/hooks/use-listing-options';
import type { DealFilters } from '@/types/listing';
import {
  countSelected,
  dealSections,
  normalizeDealSelection,
  parseDealParams,
} from '@/utils/listing-filters';

export function DealListScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const requireAuth = useRequireAuth();
  const params = useLocalSearchParams();
  const [filters, setFilters] = useState<DealFilters>(() => parseDealParams(params));
  const [sheetKey, setSheetKey] = useState<number | null>(null);
  const options = useDealFilterOptions();
  const list = useDealList(filters);

  const selection = filters.selection ?? {};
  const filterCount = countSelected(selection);
  const states = selection.state ?? [];
  const countLabel = `${list.total.toLocaleString('en-US')} negotiable ${
    list.total === 1 ? 'deal' : 'deals'
  } · price per watt${states.length ? ` · ${states.join(', ')}` : ''}${
    filters.search ? ` · “${filters.search}”` : ''
  }`;

  return (
    <View className="flex-1 bg-white">
      <ListingHeader
        title="Trader Deals"
        onBack={goBack}
        actions={[
          { icon: 'search', label: 'Search', onPress: () => router.push('/search') },
          { icon: 'cart', label: 'Cart', onPress: () => showComingSoon('Cart') },
        ]}
      />
      <ModeBar
        mode="negotiable"
        onModeChange={() =>
          router.replace({
            pathname: '/products',
            params: filters.search ? { q: filters.search } : {},
          })
        }
        activeFilterCount={filterCount}
        onOpenFilters={() => setSheetKey(Date.now())}
      />
      <ResultGrid
        data={list.items}
        keyOf={(deal) => deal.id}
        renderCard={(deal) => (
          <DealGridCard
            deal={deal}
            onPress={() => router.push(`/deals/${deal.id}`)}
            onChat={() => requireAuth('Chat')}
            onOffer={() => requireAuth('Offers')}
          />
        )}
        countLabel={countLabel}
        isLoading={list.isLoading}
        isRefreshing={list.isRefreshing}
        isLoadingMore={list.isLoadingMore}
        error={list.error}
        emptyTitle="No deals in this range"
        emptyMessage="Try removing a filter to see more deals."
        onClearFilters={filterCount ? () => setFilters({ search: filters.search }) : undefined}
        onLoadMore={list.loadMore}
        onRefresh={list.refresh}
      />
      {sheetKey !== null ? (
        <FilterSheet
          key={sheetKey}
          selection={selection}
          buildSections={(draft) => dealSections(options, draft)}
          normalize={normalizeDealSelection}
          onClose={() => setSheetKey(null)}
          onApply={(next) => {
            setFilters({ selection: normalizeDealSelection(next), search: filters.search });
            setSheetKey(null);
          }}
        />
      ) : null}
    </View>
  );
}
