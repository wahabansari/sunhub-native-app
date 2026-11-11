import { ScrollView, View } from 'react-native';

import { DealCard } from '@/components/catalog/deal-card';
import type { SectionState } from '@/hooks/use-home-sections';
import type { HomeDeal } from '@/types/home';

import { SectionHeader } from './section-header';
import { SectionPlaceholder } from './section-placeholder';

type Props = {
  state: SectionState<HomeDeal[]>;
  onSeeAll?: () => void;
  onSelect?: (deal: HomeDeal) => void;
};

export function FeaturedDealsSection({ state, onSeeAll, onSelect }: Props) {
  const deals = state.data ?? [];

  return (
    <View className="mt-lg bg-alt pb-[20px] pt-lg">
      <SectionHeader title="Featured trader deals" actionLabel="See all" onAction={onSeeAll} />
      {deals.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-sm px-md pb-[4px]"
        >
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} tone="white" onPress={() => onSelect?.(deal)} />
          ))}
        </ScrollView>
      ) : (
        <SectionPlaceholder state={state} emptyText="No featured deals available right now." />
      )}
    </View>
  );
}
