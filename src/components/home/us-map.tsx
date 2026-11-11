import { Pressable, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

import { Icon } from '@/components/icons/icon';
import { colors } from '@/theme/tokens';
import type { PickupTier } from '@/utils/pickup';

import { US_MAP_VIEWBOX, US_STATE_LABELS, US_STATES } from './us-map-data';

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const BUTTON_STEP = 1.7;
const VERTICAL_PADDING = 44;
const FILL: Record<PickupTier | 'none', string> = {
  hi: colors.primary,
  has: colors.accent,
  none: colors.border,
};

type Props = {
  tiers: Record<string, PickupTier>;
  onSelect: (code: string) => void;
};

type ZoomButtonProps = {
  icon: 'plus' | 'minus';
  label: string;
  onPress: () => void;
};

function ZoomButton({ icon, label, onPress }: ZoomButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-10 w-10 items-center justify-center bg-white active:bg-chip"
    >
      <Icon name={icon} size={18} color={colors.ink} strokeWidth={2.2} />
    </Pressable>
  );
}

function clampValue(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

export function UsMap({ tiers, onSelect }: Props) {
  const { width } = useWindowDimensions();
  const mapHeight = (width * US_MAP_VIEWBOX.height) / US_MAP_VIEWBOX.width;
  const frameHeight = Math.round(mapHeight + VERTICAL_PADDING);

  const scale = useSharedValue(MIN_SCALE);
  const savedScale = useSharedValue(MIN_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  // How far the zoomed map may be dragged before its edge would leave the frame.
  const limitX = (zoom: number) => {
    'worklet';
    return Math.max(0, (width * zoom - width) / 2);
  };
  const limitY = (zoom: number) => {
    'worklet';
    return Math.max(0, (mapHeight * zoom - frameHeight) / 2);
  };

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      const next = clampValue(savedScale.get() * event.scale, MIN_SCALE, MAX_SCALE);
      scale.set(next);
      translateX.set(clampValue(translateX.get(), -limitX(next), limitX(next)));
      translateY.set(clampValue(translateY.get(), -limitY(next), limitY(next)));
    })
    .onEnd(() => {
      savedScale.set(scale.get());
      savedX.set(translateX.get());
      savedY.set(translateY.get());
    });

  // The pan only claims the touch once zoomed, so the page can still scroll over the whole map.
  const pan = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((_event, manager) => {
      if (scale.get() > MIN_SCALE + 0.01) manager.activate();
      else manager.fail();
    })
    .onUpdate((event) => {
      const zoom = scale.get();
      translateX.set(clampValue(savedX.get() + event.translationX, -limitX(zoom), limitX(zoom)));
      translateY.set(clampValue(savedY.get() + event.translationY, -limitY(zoom), limitY(zoom)));
    })
    .onEnd(() => {
      savedX.set(translateX.get());
      savedY.set(translateY.get());
    });

  const gesture = Gesture.Simultaneous(pinch, pan);

  const mapStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.get() },
      { translateY: translateY.get() },
      { scale: scale.get() },
    ],
  }));

  const zoomTo = (factor: number) => {
    const next = clampValue(scale.get() * factor, MIN_SCALE, MAX_SCALE);
    scale.set(withTiming(next, { duration: 220 }));
    savedScale.set(next);
    const x = clampValue(translateX.get(), -limitX(next), limitX(next));
    const y = clampValue(translateY.get(), -limitY(next), limitY(next));
    translateX.set(withTiming(x, { duration: 220 }));
    translateY.set(withTiming(y, { duration: 220 }));
    savedX.set(x);
    savedY.set(y);
  };

  return (
    <View
      className="items-center justify-center overflow-hidden border-y border-hairline bg-alt"
      style={{ height: frameHeight }}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View style={[{ width, height: mapHeight }, mapStyle]}>
          <Svg
            width={width}
            height={mapHeight}
            viewBox={`0 0 ${US_MAP_VIEWBOX.width} ${US_MAP_VIEWBOX.height}`}
            accessibilityLabel="Map of US states with Sunhub local pickup deals"
          >
            {US_STATES.map((state) => (
              <Path
                key={state.code}
                d={state.d}
                fill={FILL[tiers[state.code] ?? 'none']}
                stroke="#FFFFFF"
                strokeWidth={1.4}
                strokeLinejoin="round"
                onPress={() => onSelect(state.code)}
              />
            ))}
            {US_STATE_LABELS.map((label) => {
              const tier = tiers[label.code];
              return (
                <SvgText
                  key={label.code}
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  fontFamily="Inter_700Bold"
                  fontSize={tier ? 19 : 16}
                  fill={tier === 'hi' ? '#FFFFFF' : tier === 'has' ? colors.ink : colors.muted}
                  pointerEvents="none"
                >
                  {label.code}
                </SvgText>
              );
            })}
          </Svg>
        </Animated.View>
      </GestureDetector>
      <View className="absolute bottom-[12px] right-[12px] overflow-hidden rounded-[10px] border border-border bg-white">
        <ZoomButton icon="plus" label="Zoom in" onPress={() => zoomTo(BUTTON_STEP)} />
        <View className="h-px bg-hairline" />
        <ZoomButton icon="minus" label="Zoom out" onPress={() => zoomTo(1 / BUTTON_STEP)} />
      </View>
    </View>
  );
}
