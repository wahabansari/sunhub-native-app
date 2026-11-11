import { Text } from 'react-native';

type Props = {
  prompt: string;
  label: string;
  onPress: () => void;
};

/** "Don't have an account? Register now" style footer link shared by the auth screens. */
export function AuthLink({ prompt, label, onPress }: Props) {
  return (
    <Text className="text-center font-inter text-[14px] text-muted">
      {prompt}{' '}
      <Text
        onPress={onPress}
        accessibilityRole="link"
        className="font-poppins-semibold text-primary"
      >
        {label}
      </Text>
    </Text>
  );
}
