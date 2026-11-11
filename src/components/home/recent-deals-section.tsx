import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { colors } from '@/theme/tokens';
import type { SectionState } from '@/hooks/use-home-sections';
import type { HomeDeal } from '@/types/home';
import { dealPrice, wattageOf } from '@/utils/home-format';

import { SectionHeader } from './section-header';
import { SectionPlaceholder } from './section-placeholder';

type RowProps = {
  deal: HomeDeal;
  isLast: boolean;
  onPress?: () => void;
};

function RecentDealRow({ deal, isLast, onPress }: RowProps) {
  const watts = wattageOf(deal);
  const price = dealPrice(deal, 4);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${deal.name}, ${price.amount} ${price.long}`}
      className={`min-h-[56px] flex-row items-center gap-[12px] bg-white px-md py-[10px] active:bg-chip ${
        isLast ? '' : 'border-b border-[#F1F3F6]'
      }`}
    >
      <View className="h-9 min-w-[54px] flex-row items-baseline justify-center gap-px rounded-md bg-chip px-[6px] pt-[8px]">
        <Text className="font-inter-bold text-[15px] leading-[18px] text-ink">{watts ?? '—'}</Text>
        {watts ? <Text className="font-inter-semibold text-[10px] text-muted">W</Text> : null}
      </View>
      <View className="min-w-0 flex-1 gap-[2px]">
        <Text className="font-inter-semibold text-[13.5px] text-ink" numberOfLines={1}>
          {deal.brand || deal.name}
        </Text>
        <View className="flex-row items-center gap-[4px]">
          <Icon name="pin" size={12} color={colors.faint} />
          <Text className="flex-1 font-inter text-[12px] text-muted" numberOfLines={1}>
            {deal.location}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="font-inter-bold text-[14px] text-ink">{price.amount}</Text>
        <Text className="font-inter text-[10.5px] text-muted">{price.long}</Text>
      </View>
      <Icon name="chevron" size={16} color={colors.faint} />
    </Pressable>
  );
}

type Props = {
  state: SectionState<HomeDeal[]>;
  onSeeAll?: () => void;
  onSelect?: (deal: HomeDeal) => void;
};

export function RecentDealsSection({ state, onSeeAll, onSelect }: Props) {
  const deals = state.data ?? [];

  return (
    <View className="pt-lg">
      <SectionHeader title="Recent deals" actionLabel="See all" onAction={onSeeAll} />
      {deals.length ? (
        <View className="border-t border-hairline">
          {deals.map((deal, index) => (
            <RecentDealRow
              key={deal.id}
              deal={deal}
              isLast={index === deals.length - 1}
              onPress={() => onSelect?.(deal)}
            />
          ))}
        </View>
      ) : (
        <SectionPlaceholder state={state} emptyText="No recent deals yet." kind="list" />
      )}
    </View>
  );
}
