import { useRouter, type useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { DealGridCard } from '@/components/catalog/deal-grid-card';
import { FilterSheet } from '@/components/listing/filter-sheet';
import { ResultGrid } from '@/components/listing/result-grid';
import { useDealList } from '@/hooks/use-deal-list';
import { useDealFilterOptions } from '@/hooks/use-listing-options';
import { useRequireAuth } from '@/hooks/use-require-auth';
import type { DealFilters } from '@/types/listing';
import {
  countSelected,
  dealSections,
  normalizeDealSelection,
  parseDealParams,
} from '@/utils/listing-filters';

import type { MarketplacePane } from './marketplace-pane';

/** The "Negotiable" half of the marketplace page: its own filters, list and filter sheet. */
export function useDealsPane(
  params: ReturnType<typeof useLocalSearchParams>,
  active: boolean,
): MarketplacePane {
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const [filters, setFilters] = useState<DealFilters>(() => parseDealParams(params));
  const [sheetKey, setSheetKey] = useState<number | null>(null);
  const options = useDealFilterOptions();
  const list = useDealList(filters, active);

  const selection = filters.selection ?? {};
  const filterCount = countSelected(selection);
  const states = selection.state ?? [];
  const countLabel = `${list.total.toLocaleString('en-US')} negotiable ${
    list.total === 1 ? 'deal' : 'deals'
  } · price per watt${states.length ? ` · ${states.join(', ')}` : ''}${
    filters.search ? ` · “${filters.search}”` : ''
  }`;

  return {
    title: 'Trader Deals',
    isLoading: list.isLoading,
    filterCount,
    openFilters: () => setSheetKey(Date.now()),
    grid: (
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
    ),
    sheet:
      sheetKey !== null ? (
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
      ) : null,
  };
}
