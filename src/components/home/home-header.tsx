import { Pressable, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icons/icon';
import { colors } from '@/theme/tokens';

import { SunhubLogo } from './sunhub-logo';

const SHADOW_SCROLL_RANGE = [0, 24] as const;

type ButtonProps = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  showDot?: boolean;
};

function HeaderButton({ icon, label, onPress, showDot = false }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-10 w-10 items-center justify-center rounded-full active:bg-chip"
    >
      <Icon name={icon} size={22} color={colors.ink} />
      {showDot ? (
        <View className="absolute right-[11px] top-[10px] h-[13px] w-[13px] rounded-full border-2 border-white bg-primary" />
      ) : null}
    </Pressable>
  );
}

type Props = {
  /** Vertical scroll offset of the page; the header gains a shadow once content scrolls under it. */
  scrollY?: SharedValue<number>;
  hasUnreadNotifications?: boolean;
  onProfile?: () => void;
  onNotifications?: () => void;
  onCart?: () => void;
};

export function HomeHeader({
  scrollY,
  hasUnreadNotifications = false,
  onProfile,
  onNotifications,
  onCart,
}: Props) {
  const insets = useSafeAreaInsets();

  const shadowStyle = useAnimatedStyle(() => {
    const progress = scrollY
      ? interpolate(scrollY.value, SHADOW_SCROLL_RANGE, [0, 1], Extrapolation.CLAMP)
      : 0;
    return { shadowOpacity: progress * 0.14, elevation: progress * 4 };
  });

  return (
    <Animated.View
      className="z-10 border-b border-[#EEF0F3] bg-white"
      style={[
        {
          paddingTop: insets.top,
          shadowColor: colors.ink,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        },
        shadowStyle,
      ]}
    >
      <View className="h-[52px] flex-row items-center pl-md pr-sm">
        <View className="flex-1">
          <SunhubLogo height={24} />
        </View>
        <HeaderButton icon="user" label="Profile" onPress={onProfile} />
        <HeaderButton
          icon="bell"
          label="Notifications"
          onPress={onNotifications}
          showDot={hasUnreadNotifications}
        />
        <HeaderButton icon="cart" label="Cart" onPress={onCart} />
      </View>
    </Animated.View>
  );
}
