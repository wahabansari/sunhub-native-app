import type { ReactNode } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

const STEP_MS = 70;
/** Sections below the first screen skip the entrance animation: nobody sees it, and it costs a layout animation each. */
const ANIMATED_SECTIONS = 3;
const DURATION_MS = 480;

type Props = {
  children: ReactNode;
  /** Position in the page; later sections reveal slightly after earlier ones. */
  index?: number;
};

export function Reveal({ children, index = 0 }: Props) {
  if (index >= ANIMATED_SECTIONS) return <>{children}</>;

  const delay = index * STEP_MS;

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(DURATION_MS)}>
      {children}
    </Animated.View>
  );
}
