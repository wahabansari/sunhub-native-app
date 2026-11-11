import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/icons/icon';
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

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View className="items-center gap-sm py-[56px]">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="font-inter text-[13px] text-muted">{label}</Text>
    </View>
  );
}
