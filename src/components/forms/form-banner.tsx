import { Pressable, Text, View } from 'react-native';

type Tone = 'error' | 'info' | 'success';

type Props = {
  tone: Tone;
  message: string;
  action?: { label: string; onPress: () => void; isBusy?: boolean };
};

const TONE_CLASSES: Record<Tone, { box: string; text: string }> = {
  error: { box: 'border-[#FECACA] bg-[#FEF2F2]', text: 'text-danger' },
  info: { box: 'border-[#FDE2C4] bg-primary-light', text: 'text-ink' },
  success: { box: 'border-[#BBF7D0] bg-[#F0FDF4]', text: 'text-success-ink' },
};

/** Inline status message for a form; announced to screen readers when it appears. */
export function FormBanner({ tone, message, action }: Props) {
  const classes = TONE_CLASSES[tone];

  return (
    <View
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      className={`gap-[8px] rounded-[14px] border px-[14px] py-[12px] ${classes.box}`}
    >
      <Text className={`font-inter-medium text-[13.5px] leading-[19px] ${classes.text}`}>
        {message}
      </Text>
      {action ? (
        <Pressable
          onPress={action.isBusy ? undefined : action.onPress}
          hitSlop={8}
          accessibilityRole="button"
          className="self-start"
        >
          <Text className="font-poppins-semibold text-[13.5px] text-primary">
            {action.isBusy ? 'Sending…' : action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
