import { ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { ProductImage } from '@/components/catalog/product-image';
import { Icon } from '@/components/icons/icon';
import { PressableScale } from '@/components/motion/pressable-scale';
import { SPOTLIGHT_FEATURES } from '@/constants/home-content';
import { colors } from '@/theme/tokens';
import type { SectionState } from '@/hooks/use-home-sections';
import type { HomeDeal } from '@/types/home';
import { dealPrice, formatMoney, formatPerWatt } from '@/utils/home-format';

import { SectionHeader } from './section-header';
import { SectionPlaceholder } from './section-placeholder';

const CARD_GUTTER = 44;
const CARD_GAP = 12;

type CardProps = {
  deal: HomeDeal;
  width: number;
  onChat?: () => void;
  onViewDetails?: () => void;
};

function SpotlightCard({ deal, width, onChat, onViewDetails }: CardProps) {
  const savings = deal.compareAt ? deal.compareAt - deal.pricePerWatt : 0;
  const price = dealPrice(deal);
  const money = (value: number) => (deal.perWatt ? formatPerWatt(value) : formatMoney(value));

  return (
    <View style={{ width }} className="gap-[12px]">
      <View
        className="h-[230px] items-center justify-center overflow-hidden rounded-[20px] bg-chip"
        style={{ isolation: 'isolate' }}
      >
        <ProductImage
          uri={deal.imageUrl}
          label={deal.name}
          inset={{ top: 24, x: 18, bottom: 18 }}
          fallbackSize={56}
        />
        {deal.category ? (
          <View className="absolute left-[12px] top-[12px] rounded-full bg-white px-[10px] py-[4px]">
            <Text className="font-inter-semibold text-[11px] text-ink">{deal.category}</Text>
          </View>
        ) : null}
      </View>
      <View className="gap-sm">
        {deal.location ? (
          <View className="flex-row items-center gap-[4px]">
            <Icon name="pin" size={12} color={colors.muted} />
            <Text className="font-inter-medium text-[12px] text-muted">{deal.location}</Text>
          </View>
        ) : null}
        <Text
          className="font-poppins-semibold text-[16px] leading-[21.6px] text-ink"
          numberOfLines={2}
        >
          {deal.name}
        </Text>
        <View className="flex-row flex-wrap items-baseline gap-sm">
          <Text className="font-inter-bold text-[24px] text-ink">
            {price.amount}
            {price.short ? (
              <Text className="font-inter-medium text-[13px] text-muted"> {price.short}</Text>
            ) : null}
          </Text>
          {deal.compareAt ? (
            <Text className="font-inter text-[13px] text-faint line-through">
              {money(deal.compareAt)}
            </Text>
          ) : null}
          {savings > 0 ? (
            <Text className="font-inter-semibold text-[12px] text-success-ink">
              Save {money(savings)}
              {price.short}
            </Text>
          ) : null}
        </View>
        <View className="flex-row flex-wrap gap-[12px]">
          {SPOTLIGHT_FEATURES.map((feature) => (
            <View key={feature} className="flex-row items-center gap-[4px]">
              <Icon name="check" size={13} color={colors.successInk} strokeWidth={2.6} />
              <Text className="font-inter-medium text-[12px] text-[#374151]">{feature}</Text>
            </View>
          ))}
        </View>
        <View className="mt-[6px] flex-row gap-sm">
          <PressableScale
            onPress={onChat}
            accessibilityRole="button"
            accessibilityLabel={`Chat about ${deal.name}`}
            className="h-[34px] rounded-full bg-primary"
            contentClassName="h-full items-center justify-center px-[14px]"
            scaleTo={0.95}
          >
            <Text className="font-poppins-semibold text-[12.5px] text-white">Chat now</Text>
          </PressableScale>
          <PressableScale
            onPress={onViewDetails}
            accessibilityRole="button"
            accessibilityLabel={`View details for ${deal.name}`}
            className="h-[34px] rounded-full border border-[#D1D5DB] bg-white"
            contentClassName="h-full items-center justify-center px-[14px]"
            scaleTo={0.95}
          >
            <Text className="font-poppins-semibold text-[12.5px] text-ink">View details</Text>
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

type Props = {
  state: SectionState<HomeDeal[]>;
  /** Shown when there are no hot deals, e.g. the featured deals. */
  fallback?: HomeDeal[];
  onChat?: (deal: HomeDeal) => void;
  onViewDetails?: (deal: HomeDeal) => void;
};

export function SpotlightSection({ state, fallback = [], onChat, onViewDetails }: Props) {
  const { width } = useWindowDimensions();
  const deals = state.data?.length ? state.data : fallback;
  const cardWidth = width - CARD_GUTTER;

  return (
    <View className="pt-lg">
      <SectionHeader title="Spotlight" />
      {deals.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + CARD_GAP}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 16, gap: CARD_GAP }}
        >
          {deals.map((deal) => (
            <SpotlightCard
              key={deal.id}
              deal={deal}
              width={cardWidth}
              onChat={() => onChat?.(deal)}
              onViewDetails={() => onViewDetails?.(deal)}
            />
          ))}
        </ScrollView>
      ) : (
        <SectionPlaceholder
          state={state}
          emptyText="No spotlight deals right now."
          kind="block"
          height={280}
        />
      )}
    </View>
  );
}
