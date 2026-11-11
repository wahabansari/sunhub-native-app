import { Image, ScrollView, Text, View } from 'react-native';

import { PressableScale } from '@/components/motion/pressable-scale';
import { HOME_CATEGORIES } from '@/constants/home-content';
import type { HomeCategory } from '@/types/home';

import { CATEGORY_ART } from './category-art';
import { SectionHeader } from './section-header';

type Props = {
  onSelect?: (category: HomeCategory) => void;
  onSeeAll?: () => void;
};

export function CategoriesRow({ onSelect, onSeeAll }: Props) {
  return (
    <View className="pt-lg">
      <SectionHeader title="Shop solar by category" actionLabel="See all" onAction={onSeeAll} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-sm px-md pb-[4px]"
      >
        {HOME_CATEGORIES.map((category) => (
          <PressableScale
            key={category.id}
            onPress={() => onSelect?.(category)}
            accessibilityRole="button"
            accessibilityLabel={category.name}
            className="h-[46px] rounded-full bg-chip"
            contentClassName="h-full flex-row items-center gap-sm pl-[5px] pr-md"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
              <Image source={CATEGORY_ART[category.art]} className="h-7 w-7" resizeMode="contain" />
            </View>
            <Text className="font-poppins-semibold text-[13px] text-ink">{category.name}</Text>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  );
}
