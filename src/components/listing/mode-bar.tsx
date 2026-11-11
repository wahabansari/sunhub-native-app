import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { colors } from '@/theme/tokens';
import type { ListingMode } from '@/types/listing';

const MODES = [
  { mode: 'negotiable', label: 'Negotiable', icon: 'scale' },
  { mode: 'buy', label: 'Buy now', icon: 'cart' },
] as const;

type Props = {
  mode: ListingMode;
  onModeChange: (mode: ListingMode) => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
};

export function ModeBar({ mode, onModeChange, activeFilterCount, onOpenFilters }: Props) {
  return (
    <View className="flex-row gap-sm border-b border-[#EEF0F3] bg-white px-[12px] py-sm">
      <View className="flex-1 flex-row gap-[4px] rounded-full bg-chip p-[3px]">
        {MODES.map((item) => {
          const selected = item.mode === mode;
          return (
            <Pressable
              key={item.mode}
              onPress={() => !selected && onModeChange(item.mode)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              className={`h-[34px] flex-1 flex-row items-center justify-center gap-[5px] rounded-full border ${
                selected ? 'border-primary bg-primary-light' : 'border-transparent'
              }`}
            >
              <Icon name={item.icon} size={15} color={selected ? colors.primary : colors.inkSoft} />
              <Text
                className={`font-poppins-medium text-[12.5px] ${
                  selected ? 'text-primary' : 'text-ink-soft'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        onPress={onOpenFilters}
        accessibilityRole="button"
        accessibilityLabel={activeFilterCount ? `Filters, ${activeFilterCount} applied` : 'Filters'}
        className="h-10 w-10 items-center justify-center rounded-full border border-[#D1D5DB] bg-white active:bg-chip"
      >
        <Icon name="sliders" size={18} color={colors.ink} />
        {activeFilterCount ? (
          <View className="absolute right-[-5px] top-[-5px] h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-[4px]">
            <Text className="font-inter-bold text-[10px] leading-[16px] text-white">
              {activeFilterCount}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
