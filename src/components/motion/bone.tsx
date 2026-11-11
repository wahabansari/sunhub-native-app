import { useEffect } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const PULSE_MS = 700;

/** A pulsing placeholder block; size and shape come from `className`. */
export function Bone({ className }: { className: string }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.45, { duration: PULSE_MS, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: PULSE_MS, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return <Animated.View className={`bg-chip ${className}`} style={style} />;
}
