import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const PULSE_MS = 700;

/** One pulse drives the whole skeleton, so a screen full of placeholders runs a single animation. */
export function SkeletonPulse({ children }: { children: ReactNode }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.set(
      withRepeat(
        withSequence(
          withTiming(0.45, { duration: PULSE_MS, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: PULSE_MS, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.get() }));

  return (
    // The entering animation and the pulse both drive opacity, so they live on separate views.
    <Animated.View entering={FadeIn.duration(180)}>
      <Animated.View style={style}>{children}</Animated.View>
    </Animated.View>
  );
}

/** A placeholder block; size and shape come from `className`. Wrap a group of them in `SkeletonPulse`. */
export function Bone({ className }: { className: string }) {
  return <View className={`bg-chip ${className}`} />;
}
