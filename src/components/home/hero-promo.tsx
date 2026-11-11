import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/icons/icon';
import { PressableScale } from '@/components/motion/pressable-scale';
import { colors } from '@/theme/tokens';

const HERO_GRADIENT = `linear-gradient(145deg, ${colors.navyFrom} 0%, ${colors.navyTo} 70%)`;
const GLOW_GRADIENT = 'radial-gradient(circle, rgba(255,107,0,0.55), rgba(255,107,0,0) 70%)';
const PULSE_MS = 2400;

type Props = { onShopNow?: () => void };

export function HeroPromo({ onShopNow }: Props) {
  const glow = useSharedValue(0.75);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: PULSE_MS, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.75, { duration: PULSE_MS, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
    return () => cancelAnimation(glow);
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.9 + glow.value * 0.2 }],
  }));

  return (
    <View
      className="mx-md overflow-hidden rounded-[28px] px-[18px] pb-[20px] pt-[20px]"
      style={{ backgroundImage: HERO_GRADIENT }}
    >
      <View
        pointerEvents="none"
        className="absolute right-[-70px] top-[-70px] h-[220px] w-[220px] rounded-full border-[1.5px] border-white/10"
      />
      <Animated.View
        pointerEvents="none"
        className="absolute right-[-20px] top-[-20px] h-[120px] w-[120px] rounded-full"
        style={[{ backgroundImage: GLOW_GRADIENT }, glowStyle]}
      />

      <View className="h-[26px] flex-row items-center gap-[6px] self-start rounded-full bg-white/[0.12] pl-[10px] pr-[12px]">
        <View className="h-[6px] w-[6px] rounded-full bg-primary" />
        <Text className="font-inter-medium text-[11.5px] text-white">
          B2B marketplace for solar pros
        </Text>
      </View>
      <Text
        accessibilityRole="header"
        className="mb-[8px] mt-[14px] max-w-[92%] font-poppins-semibold text-[25px] leading-[30px] tracking-[-0.6px] text-white"
      >
        America’s #1 Solar Marketplace
      </Text>
      <Text className="mb-[20px] font-inter text-[13px] leading-[19.5px] text-white/80">
        Buy, sell & source equipment faster.
      </Text>

      <View className="flex-row items-center gap-[16px]">
        <PressableScale
          onPress={onShopNow}
          accessibilityRole="button"
          accessibilityLabel="Shop now"
          className="h-[48px] rounded-full bg-primary"
          contentClassName="h-full flex-row items-center gap-[12px] pl-[20px] pr-[6px]"
          scaleTo={0.96}
        >
          <Text className="font-poppins-semibold text-[14px] text-white">Shop now</Text>
          <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
            <Icon name="chevron" size={16} color={colors.primary} strokeWidth={2.6} />
          </View>
        </PressableScale>
        <View className="border-l border-white/[0.18] pl-[16px]">
          <Text className="font-inter-semibold text-[17px] text-white">1.5 GW</Text>
          <Text className="font-inter text-[11px] text-white/70">Live inventory</Text>
        </View>
      </View>
    </View>
  );
}
