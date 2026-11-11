import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icons/icon';
import { Bone, SkeletonPulse } from '@/components/motion/bone';
import { colors } from '@/theme/tokens';

export type HeaderAction = {
  icon: IconName;
  label: string;
  onPress: () => void;
  /** Count shown on the button; hidden at zero. */
  badge?: number;
};

type Props = {
  /** `null` shows a skeleton bar while the page's data is loading. */
  title: string | null;
  onBack: () => void;
  actions?: HeaderAction[];
};

export function ListingHeader({ title, onBack, actions = [] }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View className="border-b border-[#EEF0F3] bg-white" style={{ paddingTop: insets.top }}>
      <View className="h-[52px] flex-row items-center pl-[4px] pr-sm">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          className="h-10 w-10 items-center justify-center rounded-full active:bg-chip"
        >
          <Icon name="back" size={22} color={colors.ink} />
        </Pressable>
        {title === null ? (
          <View className="flex-1 px-[4px]">
            <SkeletonPulse>
              <Bone className="h-[18px] w-[140px] rounded-full" />
            </SkeletonPulse>
          </View>
        ) : (
          <Animated.Text
            entering={FadeIn.duration(200)}
            accessibilityRole="header"
            className="flex-1 px-[4px] font-poppins-semibold text-[17px] text-ink"
            numberOfLines={1}
          >
            {title}
          </Animated.Text>
        )}
        {actions.map((action) => (
          <Pressable
            key={action.label}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-chip"
          >
            <Icon name={action.icon} size={22} color={colors.ink} />
            {action.badge ? (
              <View className="absolute right-[2px] top-[3px] h-[16px] min-w-[16px] items-center justify-center rounded-full bg-primary px-[4px]">
                <Text className="font-inter-bold text-[10px] leading-[14px] text-white">
                  {action.badge > 99 ? '99+' : action.badge}
                </Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
