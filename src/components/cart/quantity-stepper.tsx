import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { colors } from '@/theme/tokens';

type Props = {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  /** Smaller control for list rows. */
  compact?: boolean;
};

export function QuantityStepper({ value, min, max, onChange, compact = false }: Props) {
  const box = compact ? 'h-[36px]' : 'h-[44px]';
  const button = compact ? 'h-[34px] w-[34px]' : 'h-[42px] w-[42px]';

  return (
    <View className={`${box} flex-row items-center rounded-full border border-[#D1D5DB]`}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        className={`${button} items-center justify-center rounded-full active:bg-chip ${
          value <= min ? 'opacity-40' : ''
        }`}
      >
        <Icon name="minus" size={compact ? 16 : 18} color={colors.ink} />
      </Pressable>
      <Text
        className={`min-w-[30px] text-center font-inter-semibold text-ink ${
          compact ? 'text-[14px]' : 'text-[16px]'
        }`}
      >
        {value}
      </Text>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        className={`${button} items-center justify-center rounded-full active:bg-chip ${
          value >= max ? 'opacity-40' : ''
        }`}
      >
        <Icon name="plus" size={compact ? 16 : 18} color={colors.ink} />
      </Pressable>
    </View>
  );
}
