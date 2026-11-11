import { Pressable, Text, View } from 'react-native';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: Props) {
  return (
    <View className="flex-row items-end justify-between px-md pb-[10px]">
      <Text
        accessibilityRole="header"
        className="font-poppins-semibold text-[20px] leading-[25px] tracking-[-0.3px] text-ink"
      >
        {title}
      </Text>
      {actionLabel ? (
        <Pressable
          onPress={onAction}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}: ${title}`}
        >
          <Text className="font-poppins-medium text-[13px] text-primary">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
