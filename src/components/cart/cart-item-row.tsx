import { Pressable, Text, View } from 'react-native';

import { ProductImage } from '@/components/catalog/product-image';
import { Icon } from '@/components/icons/icon';
import { colors } from '@/theme/tokens';
import type { CartItem } from '@/types/cart';
import { formatMoney } from '@/utils/home-format';

import { QuantityStepper } from './quantity-stepper';

type Props = {
  item: CartItem;
  onQuantityChange: (item: CartItem, qty: number) => void;
  onRemove: (item: CartItem) => void;
};

export function CartItemRow({ item, onQuantityChange, onRemove }: Props) {
  return (
    <View className={`flex-row gap-[12px] py-[14px] ${item.outOfStock ? 'opacity-70' : ''}`}>
      <View
        className="h-[88px] w-[88px] overflow-hidden rounded-[14px] bg-chip"
        style={{ isolation: 'isolate' }}
      >
        <ProductImage uri={item.imageUrl} label={item.name} inset={{ top: 6, x: 6, bottom: 6 }} />
      </View>
      <View className="flex-1 gap-[4px]">
        <View className="flex-row items-start gap-[8px]">
          <Text
            className="flex-1 font-poppins-medium text-[13.5px] leading-[18px] text-ink"
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <Pressable
            onPress={() => onRemove(item)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.name} from cart`}
          >
            <Icon name="close" size={18} color={colors.muted} />
          </Pressable>
        </View>
        <Text className="font-inter text-[12px] text-muted" numberOfLines={1}>
          {[item.brand, item.condition].filter(Boolean).join(' · ')}
        </Text>
        {item.outOfStock ? (
          <Text className="font-inter-semibold text-[12.5px] text-danger">
            Out of stock — remove it to check out
          </Text>
        ) : (
          <View className="mt-[4px] flex-row items-center justify-between gap-[8px]">
            <QuantityStepper
              compact
              value={item.qty}
              min={item.moq}
              max={Math.max(item.moq, item.stock)}
              onChange={(qty) => onQuantityChange(item, qty)}
            />
            <View className="items-end">
              <Text className="font-inter-bold text-[15px] text-ink">
                {formatMoney(item.lineTotal)}
              </Text>
              <Text className="font-inter text-[11px] text-muted">
                {formatMoney(item.unitPrice)} each
              </Text>
            </View>
          </View>
        )}
        {!item.outOfStock && item.moq > 1 ? (
          <Text className="font-inter text-[11px] text-muted">Minimum order {item.moq}</Text>
        ) : null}
      </View>
    </View>
  );
}
