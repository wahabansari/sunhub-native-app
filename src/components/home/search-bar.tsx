import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { Icon } from '@/components/icons/icon';
import { PressableScale } from '@/components/motion/pressable-scale';
import { colors } from '@/theme/tokens';

const PLACEHOLDERS = [
  'Search solar panels',
  'Search inverters',
  'Search batteries',
  'Search by brand or SKU',
] as const;
const HOLD_MS = 2600;
const SLIDE_MS = 420;
const SLIDE_EASING = Easing.out(Easing.cubic);

type Props = {
  onPress?: () => void;
  onFilters?: () => void;
};

export function SearchBar({ onPress, onFilters }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((value) => (value + 1) % PLACEHOLDERS.length),
      HOLD_MS,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <View className="bg-white px-md pb-[12px] pt-sm">
      <PressableScale
        onPress={onPress}
        accessibilityRole="search"
        accessibilityLabel="Search the marketplace"
        className="h-[46px] rounded-full bg-chip"
        contentClassName="h-full flex-row items-center gap-[10px] pl-md pr-[5px]"
        scaleTo={0.985}
      >
        <Icon name="search" size={19} color={colors.muted} />
        {/* Each line is its own element: the old one slides up and out while the next one slides in from below. */}
        <View className="h-[46px] flex-1 overflow-hidden">
          <Animated.Text
            key={PLACEHOLDERS[index]}
            entering={FadeInDown.duration(SLIDE_MS).easing(SLIDE_EASING)}
            exiting={FadeOutUp.duration(SLIDE_MS).easing(SLIDE_EASING)}
            numberOfLines={1}
            className="absolute inset-x-0 top-[13px] font-inter text-[14px] leading-[20px] text-muted"
          >
            {PLACEHOLDERS[index]}
          </Animated.Text>
        </View>
        <Pressable
          onPress={onFilters}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Filters"
          className="h-9 w-9 items-center justify-center rounded-full bg-white"
        >
          <Icon name="sliders" size={18} color={colors.ink} />
        </Pressable>
      </PressableScale>
    </View>
  );
}
