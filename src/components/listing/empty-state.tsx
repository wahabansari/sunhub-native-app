import { Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/icons/icon';
import { Bone, SkeletonPulse } from '@/components/motion/bone';
import { colors } from '@/theme/tokens';

type Props = {
  icon?: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon = 'search', title, message, actionLabel, onAction }: Props) {
  return (
    <View className="items-center gap-[10px] px-[32px] py-[56px]">
      <View className="mb-[6px] h-[72px] w-[72px] items-center justify-center rounded-full bg-chip">
        <Icon name={icon} size={30} color={colors.inkSoft} />
      </View>
      <Text className="text-center font-poppins-semibold text-[18px] text-ink">{title}</Text>
      {message ? (
        <Text className="text-center font-inter text-[14px] leading-[20px] text-muted">
          {message}
        </Text>
      ) : null}
      {actionLabel ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          className="mt-sm h-[42px] items-center justify-center rounded-full bg-primary px-lg active:bg-primary-pressed"
        >
          <Text className="font-poppins-semibold text-[14px] text-white">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Skeleton for a page that is still loading: a picture block and a few text lines. */
export function LoadingState() {
  return (
    <SkeletonPulse>
      <View className="gap-[12px] px-md pt-sm">
        <Bone className="aspect-[1/0.8] w-full rounded-[18px]" />
        <Bone className="h-[16px] w-[85%] rounded-full" />
        <Bone className="h-[16px] w-[55%] rounded-full" />
        <Bone className="mt-[6px] h-[26px] w-[35%] rounded-full" />
        <Bone className="h-[90px] w-full rounded-[14px]" />
      </View>
    </SkeletonPulse>
  );
}
