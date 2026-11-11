import { CardField } from '@stripe/stripe-react-native';
import { Text, View } from 'react-native';

import { FormBanner } from '@/components/forms/form-banner';
import { Icon } from '@/components/icons/icon';
import { env } from '@/config/env';
import { colors } from '@/theme/tokens';

type Props = {
  /** Called with whether the number, expiry and CVC are all complete. Nothing else leaves the field. */
  onCompleteChange: (complete: boolean) => void;
  disabled?: boolean;
};

export const isCardEntryAvailable = Boolean(env.stripePublishableKey);

/**
 * Stripe's native card field. The card number, expiry and CVC are typed into native memory owned by
 * Stripe's SDK; this component only learns whether the card looks complete, never its contents.
 */
export function CardInput({ onCompleteChange, disabled = false }: Props) {
  if (!isCardEntryAvailable) {
    return (
      <FormBanner
        tone="info"
        message="Card payments are not set up in this build yet. Add EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable them."
      />
    );
  }

  return (
    <View className="gap-[8px]">
      <Text className="font-inter-medium text-[13px] text-ink-soft">
        Card details<Text className="text-danger"> *</Text>
      </Text>
      <CardField
        postalCodeEnabled={false}
        disabled={disabled}
        onCardChange={(details) => onCompleteChange(details.complete)}
        placeholders={{ number: '4242 4242 4242 4242' }}
        cardStyle={{
          backgroundColor: '#FFFFFF',
          textColor: colors.ink,
          placeholderColor: colors.faint,
          borderColor: '#D9DDE3',
          borderWidth: 1,
          borderRadius: 14,
          fontSize: 15,
        }}
        style={{ width: '100%', height: 52 }}
      />
      <View className="flex-row items-center gap-[6px]">
        <Icon name="lock" size={13} color={colors.muted} />
        <Text className="flex-1 font-inter text-[11.5px] leading-[16px] text-muted">
          Entered securely with Stripe. Your card number is never stored in this app.
        </Text>
      </View>
    </View>
  );
}
