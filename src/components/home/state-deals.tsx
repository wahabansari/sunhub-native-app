import { Pressable, ScrollView, Text, View } from 'react-native';

import { DealCard } from '@/components/catalog/deal-card';
import { Icon } from '@/components/icons/icon';
import type { SectionState } from '@/hooks/use-home-sections';
import { colors } from '@/theme/tokens';
import type { HomeDeal } from '@/types/home';
import type { ResultPage } from '@/types/listing';

import { SectionPlaceholder } from './section-placeholder';

const MAX_CARDS = 10;

type Props = {
  stateName: string;
  state: SectionState<ResultPage<HomeDeal>>;
  onOpenDeal?: (deal: HomeDeal) => void;
  onViewAll?: () => void;
};

/** The deals of the state picked above, as a slider of cards. */
export function StateDeals({ stateName, state, onOpenDeal, onViewAll }: Props) {
  const deals = state.data?.items.slice(0, MAX_CARDS) ?? [];
  const total = state.data?.total ?? 0;

  return (
    <View className="gap-[10px] pt-[16px]">
      <View className="flex-row items-center justify-between px-md">
        <Text className="flex-1 font-poppins-semibold text-[15px] text-ink" numberOfLines={1}>
          Deals in {stateName}
        </Text>
        {total > 0 ? (
          <Pressable
            onPress={onViewAll}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`View all ${total} deals in ${stateName}`}
            className="flex-row items-center gap-[2px]"
          >
            <Text className="font-poppins-medium text-[13px] text-primary">
              View all {total.toLocaleString('en-US')}
            </Text>
            <Icon name="chevron" size={14} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
      {deals.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-sm px-md pb-[4px]"
        >
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onPress={() => onOpenDeal?.(deal)} />
          ))}
        </ScrollView>
      ) : (
        <SectionPlaceholder
          state={state}
          emptyText={`No active deals in ${stateName} right now.`}
        />
      )}
    </View>
  );
}
