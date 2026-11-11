import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/icons/icon';
import { colors } from '@/theme/tokens';
import type { ListingMode } from '@/types/listing';

const MODES = [
  { mode: 'negotiable', label: 'Negotiable', icon: 'scale' },
  { mode: 'buy', label: 'Buy now', icon: 'cart' },
] as const;

const TRACK_PADDING = 3;
const SLIDE_MS = 240;

type Props = {
  mode: ListingMode;
  onModeChange: (mode: ListingMode) => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
};

export function ModeBar({ mode, onModeChange, activeFilterCount, onOpenFilters }: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const index = MODES.findIndex((item) => item.mode === mode);
  const pillWidth = Math.max(0, (trackWidth - TRACK_PADDING * 2) / MODES.length);
  const offset = useSharedValue(0);
  const placed = useRef(false);

  useEffect(() => {
    if (pillWidth === 0) return;
    const target = index * pillWidth;
    // The first placement is instant; later changes slide.
    offset.set(
      placed.current
        ? withTiming(target, { duration: SLIDE_MS, easing: Easing.out(Easing.cubic) })
        : target,
    );
    placed.current = true;
  }, [index, offset, pillWidth]);
  const pillStyle = useAnimatedStyle(() => ({
    width: pillWidth,
    transform: [{ translateX: offset.get() }],
  }));

  return (
    <View className="flex-row gap-sm border-b border-[#EEF0F3] bg-white px-[12px] py-sm">
      <View
        className="flex-1 flex-row rounded-full bg-chip p-[3px]"
        onLayout={(event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width)}
      >
        <Animated.View
          pointerEvents="none"
          className="absolute bottom-[3px] left-[3px] top-[3px] rounded-full border border-primary bg-primary-light"
          style={pillStyle}
        />
        {MODES.map((item) => {
          const selected = item.mode === mode;
          return (
            <Pressable
              key={item.mode}
              onPress={() => !selected && onModeChange(item.mode)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              className="h-[34px] flex-1 flex-row items-center justify-center gap-[5px] rounded-full"
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
