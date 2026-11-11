import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icons/icon';
import { colors } from '@/theme/tokens';

export type HeaderAction = {
  icon: IconName;
  label: string;
  onPress: () => void;
};

type Props = {
  title: string;
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
        <Text
          accessibilityRole="header"
          className="flex-1 px-[4px] font-poppins-semibold text-[17px] text-ink"
          numberOfLines={1}
        >
          {title}
        </Text>
        {actions.map((action) => (
          <Pressable
            key={action.label}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-chip"
          >
            <Icon name={action.icon} size={22} color={colors.ink} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
