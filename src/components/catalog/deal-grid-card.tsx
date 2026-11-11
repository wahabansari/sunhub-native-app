import { Pressable, Text, View } from 'react-native';

import { ProductImage } from '@/components/catalog/product-image';
import { SponsoredBadge } from '@/components/catalog/sponsored-badge';
import { Icon } from '@/components/icons/icon';
import { PressableScale } from '@/components/motion/pressable-scale';
import { colors } from '@/theme/tokens';
import type { HomeDeal } from '@/types/home';
import { dealPrice, formatMoney, formatPerWatt, moqLabel } from '@/utils/home-format';

type Props = {
  deal: HomeDeal;
  onPress?: () => void;
  onChat?: () => void;
  onOffer?: () => void;
};

export function DealGridCard({ deal, onPress, onChat, onOffer }: Props) {
  const price = dealPrice(deal);
  const strike = deal.compareAt
    ? deal.perWatt
      ? formatPerWatt(deal.compareAt)
      : formatMoney(deal.compareAt)
    : null;
  const off = deal.compareAt
    ? Math.round(((deal.compareAt - deal.pricePerWatt) / deal.compareAt) * 100)
    : 0;
  const incoterm = deal.shipping?.split(' - ')[0];
  const info = [`MOQ ${moqLabel(deal.moq, deal.moqUnit)}`, incoterm].filter(Boolean).join(' · ');

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={deal.name}
      className="w-full"
    >
      <View
        className="aspect-[1/0.92] overflow-hidden rounded-[14px] bg-chip"
        style={{ isolation: 'isolate' }}
      >
        <ProductImage
          uri={deal.imageUrl}
          label={deal.name}
          inset={{ top: deal.sponsored ? 32 : 10 }}
        />
        {deal.sponsored ? <SponsoredBadge /> : null}
      </View>
      <View className="gap-[5px] px-[2px] pt-[8px]">
        <Text
          className="min-h-[32px] font-poppins-medium text-[12.5px] leading-[16px] text-ink"
          numberOfLines={2}
        >
          {deal.name}
        </Text>
        {deal.badges.length ? (
          <View className="flex-row flex-wrap gap-[4px]">
            {deal.badges.map((badge) => (
              <View
                key={badge}
                className="h-[20px] flex-row items-center gap-[3px] rounded-full bg-[#E8F0FF] px-[8px]"
              >
                <Icon name="check" size={10} color="#1D4ED8" strokeWidth={3} />
                <Text className="font-inter-medium text-[10px] text-[#1D4ED8]">{badge}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <View className="flex-row flex-wrap items-baseline gap-[3px]">
          <Text className="font-inter-bold text-[15px] text-ink">{price.amount}</Text>
          {price.short ? (
            <Text className="font-inter-medium text-[10.5px] text-muted">{price.short}</Text>
          ) : null}
          {strike ? (
            <Text className="ml-[2px] font-inter text-[11px] text-faint line-through">
              {strike}
            </Text>
          ) : null}
          {off > 0 ? (
            <View className="ml-[2px] h-[18px] items-center justify-center rounded-full bg-[#E6F6EC] px-[7px]">
              <Text className="font-inter-medium text-[10px] text-success-ink">-{off}%</Text>
            </View>
          ) : null}
        </View>
        <Text className="font-inter text-[10.5px] text-muted" numberOfLines={1}>
          {info}
        </Text>
        <View className="mt-[2px] flex-row items-center gap-[5px]">
          <Pressable
            onPress={onChat}
            accessibilityRole="button"
            accessibilityLabel={`Chat about ${deal.name}`}
            className="h-[28px] w-[28px] items-center justify-center rounded-full border border-[#D1D5DB] bg-white active:bg-chip"
          >
            <Icon name="chat" size={14} color={colors.ink} />
          </Pressable>
          <Pressable
            onPress={onOffer}
            accessibilityRole="button"
            accessibilityLabel={`Make an offer on ${deal.name}`}
            className="h-[28px] flex-1 items-center justify-center rounded-full bg-primary active:bg-primary-pressed"
          >
            <Text className="font-poppins-semibold text-[11.5px] text-white">Make offer</Text>
          </Pressable>
        </View>
      </View>
    </PressableScale>
  );
}
