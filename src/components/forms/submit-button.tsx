import { ActivityIndicator, Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  variant?: 'solid' | 'outline';
};

export function SubmitButton({ label, onPress, isLoading = false, variant = 'solid' }: Props) {
  const solid = variant === 'solid';

  return (
    <Pressable
      onPress={isLoading ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ busy: isLoading, disabled: isLoading }}
      className={`h-[50px] flex-row items-center justify-center gap-sm rounded-full ${
        solid
          ? `bg-primary active:bg-primary-pressed ${isLoading ? 'opacity-80' : ''}`
          : 'border border-[#D1D5DB] bg-white active:bg-chip'
      }`}
    >
      {isLoading ? <ActivityIndicator color={solid ? '#FFFFFF' : '#1A2B3C'} size="small" /> : null}
      <Text className={`font-poppins-semibold text-[15px] ${solid ? 'text-white' : 'text-ink'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
