import { ScrollView, View } from 'react-native';

import { ProductCard } from '@/components/catalog/product-card';
import type { SectionState } from '@/hooks/use-home-sections';
import type { HomeProduct } from '@/types/home';

import { SectionHeader } from './section-header';
import { SectionPlaceholder } from './section-placeholder';

type Props = {
  state: SectionState<HomeProduct[]>;
  onSeeAll?: () => void;
  onSelect?: (product: HomeProduct) => void;
  onAdd?: (product: HomeProduct) => void;
};

export function BuyDirectSection({ state, onSeeAll, onSelect, onAdd }: Props) {
  const products = state.data ?? [];

  return (
    <View className="pt-lg">
      <SectionHeader title="Buy direct" actionLabel="See all" onAction={onSeeAll} />
      {products.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-sm px-md pb-[4px]"
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              layout="slide"
              product={product}
              onPress={() => onSelect?.(product)}
              onAdd={() => onAdd?.(product)}
            />
          ))}
        </ScrollView>
      ) : (
        <SectionPlaceholder state={state} emptyText="No sponsored products available right now." />
      )}
    </View>
  );
}
