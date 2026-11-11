import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ProductCard } from '@/components/catalog/product-card';
import { showComingSoon } from '@/components/feedback/notices';
import { FilterSheet } from '@/components/listing/filter-sheet';
import { ListingHeader } from '@/components/listing/listing-header';
import { ModeBar } from '@/components/listing/mode-bar';
import { ResultGrid } from '@/components/listing/result-grid';
import { HOME_CATEGORIES } from '@/constants/home-content';
import { useGoBack } from '@/hooks/use-go-back';
import { useProductFilterData } from '@/hooks/use-listing-options';
import { useProductList } from '@/hooks/use-product-list';
import { useRequireAuth } from '@/hooks/use-require-auth';
import type { ProductFilters } from '@/types/listing';
import {
  countSelected,
  normalizeProductSelection,
  parseProductParams,
  productSections,
} from '@/utils/listing-filters';

export function ProductListScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const requireAuth = useRequireAuth();
  const params = useLocalSearchParams();
  const [filters, setFilters] = useState<ProductFilters>(() => parseProductParams(params));
  const [sheetKey, setSheetKey] = useState<number | null>(null);
  const filterData = useProductFilterData();
  const list = useProductList(filters);

  const selection = filters.selection ?? {};
  const filterCount = countSelected(selection);
  const category = HOME_CATEGORIES.find(
    (entry) => String(entry.parentId) === selection.category?.[0],
  );
  const countLabel = `${list.total.toLocaleString('en-US')} ${
    list.total === 1 ? 'product' : 'products'
  }${category ? ` in ${category.name}` : ''}${filters.search ? ` for “${filters.search}”` : ''}`;

  return (
    <View className="flex-1 bg-white">
      <ListingHeader
        title={category?.name ?? 'All products'}
        onBack={goBack}
        actions={[
          { icon: 'search', label: 'Search', onPress: () => router.push('/search') },
          { icon: 'cart', label: 'Cart', onPress: () => showComingSoon('Cart') },
        ]}
      />
      <ModeBar
        mode="buy"
        onModeChange={() =>
          router.replace({
            pathname: '/deals',
            params: filters.search ? { q: filters.search } : {},
          })
        }
        activeFilterCount={filterCount}
        onOpenFilters={() => setSheetKey(Date.now())}
      />
      <ResultGrid
        data={list.items}
        keyOf={(product) => product.id}
        renderCard={(product) => (
          <ProductCard
            layout="fluid"
            product={product}
            onPress={() => router.push(`/products/${product.id}`)}
            onAdd={() => requireAuth('Cart')}
          />
        )}
        countLabel={countLabel}
        isLoading={list.isLoading}
        isRefreshing={list.isRefreshing}
        isLoadingMore={list.isLoadingMore}
        error={list.error}
        emptyTitle="No matches"
        emptyMessage="Clear a filter to see more products."
        onClearFilters={filterCount ? () => setFilters({ search: filters.search }) : undefined}
        onLoadMore={list.loadMore}
        onRefresh={list.refresh}
      />
      {sheetKey !== null ? (
        <FilterSheet
          key={sheetKey}
          selection={selection}
          buildSections={(draft) => productSections(filterData, draft)}
          normalize={normalizeProductSelection}
          onClose={() => setSheetKey(null)}
          onApply={(next) => {
            setFilters({ selection: normalizeProductSelection(next), search: filters.search });
            setSheetKey(null);
          }}
        />
      ) : null}
    </View>
  );
}
