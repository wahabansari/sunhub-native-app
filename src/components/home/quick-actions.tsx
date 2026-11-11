import { Text, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { PressableScale } from '@/components/motion/pressable-scale';
import { QUICK_ACTIONS } from '@/constants/home-content';
import { colors } from '@/theme/tokens';

type ActionId = (typeof QUICK_ACTIONS)[number]['id'];

type Props = { onPress?: (id: ActionId) => void };

export function QuickActions({ onPress }: Props) {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-sm px-md pb-[4px] pt-md">
      {QUICK_ACTIONS.map((action) => (
        <PressableScale
          key={action.id}
          onPress={() => onPress?.(action.id)}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          className="h-[50px] w-[48.6%] rounded-full bg-chip"
          contentClassName="h-full flex-row items-center gap-sm px-[14px]"
        >
          <Icon name={action.icon} size={22} color={colors.primary} />
          <Text className="font-poppins-semibold text-[13.5px] text-ink" numberOfLines={1}>
            {action.label}
          </Text>
        </PressableScale>
      ))}
    </View>
  );
}
