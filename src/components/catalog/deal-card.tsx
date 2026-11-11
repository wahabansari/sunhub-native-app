import { Text, View } from 'react-native';

import { ProductImage } from '@/components/catalog/product-image';
import { SponsoredBadge } from '@/components/catalog/sponsored-badge';
import { PressableScale } from '@/components/motion/pressable-scale';
import type { HomeDeal } from '@/types/home';
import { dealPrice, formatMoney, formatPerWatt, moqLabel } from '@/utils/home-format';

const ISOLATE = { isolation: 'isolate' } as const;

type Props = {
  deal: HomeDeal;
  onPress?: () => void;
  /** Image tile colour: use `white` on grey sections and `gray` on white ones so the tile always contrasts. */
  tone?: 'white' | 'gray';
};

export function DealCard({ deal, onPress, tone = 'gray' }: Props) {
  const price = dealPrice(deal);
  const info = [`MOQ ${moqLabel(deal.moq, deal.moqUnit)}`, deal.location]
    .filter(Boolean)
    .join(' · ');
  const strike = deal.compareAt
    ? deal.perWatt
      ? formatPerWatt(deal.compareAt)
      : formatMoney(deal.compareAt)
    : null;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={deal.name}
      className="w-[146px]"
    >
      <View
        className={`aspect-[1/0.9] overflow-hidden rounded-[14px] ${
          tone === 'white' ? 'border border-hairline bg-white' : 'bg-chip'
        }`}
        style={tone === 'gray' ? ISOLATE : undefined}
      >
        <ProductImage
          uri={deal.imageUrl}
          label={deal.name}
          inset={{ top: 28, bottom: 8 }}
          blend={tone === 'gray'}
        />
        {deal.sponsored ? <SponsoredBadge /> : null}
      </View>
      <View className="gap-[4px] px-[2px] pt-[6px]">
        <Text
          className="min-h-[31px] font-poppins-medium text-[12px] leading-[15.6px] text-ink"
          numberOfLines={2}
        >
          {deal.name}
        </Text>
        <View className="flex-row items-baseline gap-[3px]">
          <Text className="font-inter-bold text-[14px] text-ink">{price.amount}</Text>
          {price.short ? (
            <Text className="font-inter-medium text-[10.5px] text-muted">{price.short}</Text>
          ) : null}
          {strike ? (
            <Text className="ml-[3px] font-inter text-[11px] text-faint line-through">
              {strike}
            </Text>
          ) : null}
        </View>
        <Text className="font-inter text-[10.5px] text-muted" numberOfLines={1}>
          {info}
        </Text>
      </View>
    </PressableScale>
  );
}
