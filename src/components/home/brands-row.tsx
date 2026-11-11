import { Image, ScrollView, Text, View } from 'react-native';

import { PressableScale } from '@/components/motion/pressable-scale';
import type { SectionState } from '@/hooks/use-home-sections';
import type { HomeBrand } from '@/types/home';

import { SectionHeader } from './section-header';
import { SectionPlaceholder } from './section-placeholder';

type Props = {
  state: SectionState<HomeBrand[]>;
  onSelect?: (brand: HomeBrand) => void;
  onSeeAll?: () => void;
};

export function BrandsRow({ state, onSelect, onSeeAll }: Props) {
  const brands = state.data ?? [];

  return (
    <View className="pt-lg">
      <SectionHeader title="Top brands" actionLabel="View all" onAction={onSeeAll} />
      {brands.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-[10px] px-md"
        >
          {brands.map((brand) => (
            <PressableScale
              key={brand.id}
              onPress={() => onSelect?.(brand)}
              accessibilityRole="button"
              accessibilityLabel={brand.name}
              className="h-[80px] w-[124px] overflow-hidden rounded-[16px] bg-chip"
              contentClassName="h-full w-full items-center justify-center"
            >
              {brand.logoUrl ? (
                <Image
                  source={{ uri: brand.logoUrl }}
                  className="h-[48px] w-[96px]"
                  style={{ mixBlendMode: 'multiply' }}
                  resizeMode="contain"
                  accessibilityLabel={brand.name}
                />
              ) : (
                <Text className="px-sm text-center font-poppins-semibold text-[15px] text-ink">
                  {brand.name}
                </Text>
              )}
            </PressableScale>
          ))}
        </ScrollView>
      ) : (
        <SectionPlaceholder state={state} emptyText="Brands are unavailable right now." />
      )}
    </View>
  );
}
