import { Pressable, Text, View } from 'react-native';

import { ProductImage } from '@/components/catalog/product-image';
import { SponsoredBadge } from '@/components/catalog/sponsored-badge';
import { Icon } from '@/components/icons/icon';
import { PressableScale } from '@/components/motion/pressable-scale';
import { colors } from '@/theme/tokens';
import type { HomeProduct } from '@/types/home';
import { formatMoney } from '@/utils/home-format';

type Props = {
  product: HomeProduct;
  onPress?: () => void;
  onAdd?: () => void;
  /** `half`: two per row, `fluid`: fill the grid cell, `slide`: fixed width for horizontal sliders. */
  layout?: 'half' | 'fluid' | 'slide';
};

const LAYOUT_CLASS = { half: 'w-[48.6%]', fluid: 'w-full', slide: 'w-[172px]' } as const;

export function ProductCard({ product, onPress, onAdd, layout = 'half' }: Props) {
  const inStock = (product.stock ?? 0) > 0;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={product.name}
      className={LAYOUT_CLASS[layout]}
    >
      <View
        className="aspect-[1/0.92] overflow-hidden rounded-[14px] bg-chip"
        style={{ isolation: 'isolate' }}
      >
        <ProductImage
          uri={product.imageUrl}
          label={product.name}
          inset={{ top: product.sponsorLabel ? 32 : 10 }}
          fallbackSize={40}
        />
        {product.sponsorLabel ? <SponsoredBadge label={product.sponsorLabel} /> : null}
      </View>
      <View className="gap-[5px] px-[2px] pt-[8px]">
        {product.badges.length ? (
          <View className="flex-row flex-wrap gap-[4px]">
            {product.badges.map((badge) => (
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
        <Text
          className="min-h-[34px] font-poppins-medium text-[13px] leading-[17px] text-ink"
          numberOfLines={2}
        >
          {product.name}
        </Text>
        <View className="gap-[1px]">
          <Text
            className={`font-inter-medium text-[12px] ${inStock ? 'text-[#15803D]' : 'text-muted'}`}
          >
            {inStock ? 'In stock' : 'Out of stock'}
          </Text>
          <View className="flex-row items-center justify-between gap-[6px]">
            <Text className="flex-1 font-inter-bold text-[17px] text-ink" numberOfLines={1}>
              {formatMoney(product.price)}
              <Text className="font-inter-medium text-[11px] text-muted"> / {product.unit}</Text>
            </Text>
            <Pressable
              onPress={onAdd}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Add ${product.name} to cart`}
              className="h-[26px] w-[26px] items-center justify-center rounded-full bg-primary active:bg-primary-pressed"
            >
              <Icon name="plus" size={14} color={colors.onPrimary} strokeWidth={2.6} />
            </Pressable>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}
