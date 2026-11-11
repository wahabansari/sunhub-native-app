import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { SunhubLogo } from '@/components/home/sunhub-logo';

const MIN_VISIBLE_MS = 1700;
const MAX_WAIT_MS = 6000;
const EXIT_MS = 450;
const RING_MS = 1900;

function PulseRing({ delay }: { delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: RING_MS, easing: Easing.out(Easing.quad) }), -1, false),
    );
    return () => cancelAnimation(progress);
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: (1 - progress.value) * 0.32,
    transform: [{ scale: 0.7 + progress.value * 1.5 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      className="absolute h-[150px] w-[150px] rounded-full border-2 border-primary"
      style={style}
    />
  );
}

type Props = {
  /** True once the screen behind the splash has its data and can be revealed. */
  canExit: boolean;
  /** Fires when the splash is first laid out, so the native splash can be hidden without a flash. */
  onShown: () => void;
  /** Fires as the exit animation starts, so the screen behind can run its own entrance. */
  onExitStart: () => void;
  onDone: () => void;
};

export function AnimatedSplash({ canExit, onShown, onExitStart, onDone }: Props) {
  const logo = useSharedValue(0);
  const tagline = useSharedValue(0);
  const exit = useSharedValue(0);
  const shown = useRef(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const shouldExit = minElapsed && (canExit || timedOut);

  useEffect(() => {
    logo.value = withSpring(1, { damping: 14, stiffness: 110 });
    tagline.value = withDelay(500, withTiming(1, { duration: 500 }));
    const minTimer = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    const maxTimer = setTimeout(() => setTimedOut(true), MAX_WAIT_MS);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
      cancelAnimation(logo);
      cancelAnimation(tagline);
    };
  }, [logo, tagline]);

  useEffect(() => {
    if (!shouldExit) return undefined;
    onExitStart();
    exit.value = withTiming(1, { duration: EXIT_MS, easing: Easing.in(Easing.quad) });
    const doneTimer = setTimeout(onDone, EXIT_MS + 30);
    return () => clearTimeout(doneTimer);
  }, [shouldExit, exit, onExitStart, onDone]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: 1 - exit.value,
    transform: [{ scale: 1 + exit.value * 0.06 }],
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, logo.value * 1.4),
    transform: [{ scale: 0.82 + logo.value * 0.18 }, { translateY: (1 - logo.value) * 10 }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: tagline.value,
    transform: [{ translateY: (1 - tagline.value) * 8 }],
  }));

  return (
    <Animated.View
      className="items-center justify-center bg-white"
      style={[StyleSheet.absoluteFill, containerStyle]}
      onLayout={() => {
        if (shown.current) return;
        shown.current = true;
        onShown();
      }}
    >
      <View className="items-center justify-center">
        <PulseRing delay={0} />
        <PulseRing delay={RING_MS / 2} />
        <Animated.View style={logoStyle}>
          <SunhubLogo height={40} />
        </Animated.View>
      </View>
      <Animated.View style={taglineStyle} className="mt-[28px] items-center gap-[10px]">
        <View className="h-[3px] w-[28px] rounded-full bg-primary" />
        <Text className="font-poppins-medium text-[12px] uppercase tracking-[2.4px] text-muted">
          Solar equipment marketplace
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
