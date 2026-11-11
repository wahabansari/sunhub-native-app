import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const SPRING = { damping: 18, stiffness: 320, mass: 0.6 } as const;

type Props = Omit<PressableProps, 'style' | 'children' | 'className'> & {
  children: ReactNode;
  /** Box styling (size, background, border, radius, margins) on the animated wrapper. */
  className?: string;
  /** Layout of the content inside the pressable area. */
  contentClassName?: string;
  scaleTo?: number;
};

export function PressableScale({
  children,
  className,
  contentClassName,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View className={className} style={animatedStyle}>
      <Pressable
        {...rest}
        className={contentClassName}
        onPressIn={(event) => {
          scale.set(withSpring(scaleTo, SPRING));
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          scale.set(withSpring(1, SPRING));
          onPressOut?.(event);
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
