import type { ReactNode } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

const STEP_MS = 70;
const MAX_STAGGER = 6;
const DURATION_MS = 480;

type Props = {
  children: ReactNode;
  /** Position in the page; later sections reveal slightly after earlier ones. */
  index?: number;
};

export function Reveal({ children, index = 0 }: Props) {
  const delay = Math.min(index, MAX_STAGGER) * STEP_MS;

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(DURATION_MS)}>
      {children}
    </Animated.View>
  );
}
