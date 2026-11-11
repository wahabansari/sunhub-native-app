import { useRouter, type useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { ProductCard } from '@/components/catalog/product-card';
import { FilterSheet } from '@/components/listing/filter-sheet';
import { ResultGrid } from '@/components/listing/result-grid';
import { HOME_CATEGORIES } from '@/constants/home-content';
import { useProductFilterData } from '@/hooks/use-listing-options';
import { useProductList } from '@/hooks/use-product-list';
import { useAddToCart } from '@/hooks/use-cart';
import type { ProductFilters } from '@/types/listing';
import {
  countSelected,
  normalizeProductSelection,
  parseProductParams,
  productSections,
} from '@/utils/listing-filters';

import type { MarketplacePane } from './marketplace-pane';

/** The "Buy now" half of the marketplace page: its own filters, list and filter sheet. */
export function useProductsPane(
  params: ReturnType<typeof useLocalSearchParams>,
  active: boolean,
): MarketplacePane {
  const router = useRouter();
  const { add } = useAddToCart();
  const [filters, setFilters] = useState<ProductFilters>(() => parseProductParams(params));
  const [sheetKey, setSheetKey] = useState<number | null>(null);
  const filterData = useProductFilterData();
  const list = useProductList(filters, active);

  const selection = filters.selection ?? {};
  const filterCount = countSelected(selection);
  const category = HOME_CATEGORIES.find(
    (entry) => String(entry.parentId) === selection.category?.[0],
  );
  const countLabel = `${list.total.toLocaleString('en-US')} ${
    list.total === 1 ? 'product' : 'products'
  }${category ? ` in ${category.name}` : ''}${filters.search ? ` for “${filters.search}”` : ''}`;

  return {
    title: category?.name ?? 'All products',
    isLoading: list.isLoading,
    filterCount,
    openFilters: () => setSheetKey(Date.now()),
    grid: (
      <ResultGrid
        data={list.items}
        keyOf={(product) => product.id}
        renderCard={(product) => (
          <ProductCard
            layout="fluid"
            product={product}
            onPress={() => router.push(`/products/${product.id}`)}
            onAdd={() =>
              add(product.id, product.moq ?? 1, { moq: product.moq, stock: product.stock })
            }
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
    ),
    sheet:
      sheetKey !== null ? (
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
      ) : null,
  };
}
