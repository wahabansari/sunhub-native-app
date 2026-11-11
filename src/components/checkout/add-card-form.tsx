import { useState } from 'react';
import { Text, View } from 'react-native';

import { FormBanner } from '@/components/forms/form-banner';
import { SubmitButton } from '@/components/forms/submit-button';
import { TextField } from '@/components/forms/text-field';
import { CheckboxRow } from '@/components/forms/checkbox-row';
import { toUserMessage } from '@/errors';
import { useCardTokenizer } from '@/hooks/use-card-tokenizer';
import { useAddCard } from '@/hooks/use-saved-profile';
import type { ShippingAddress } from '@/types/cart';
import { hasFormErrors } from '@/validation/auth';
import { validateBilling, type BillingErrors } from '@/validation/checkout';

import { AddressFields } from './address-fields';
import { CardInput } from './card-input';

type Props = {
  /** The shipping address the buyer picked, offered as the billing address. */
  shipping: ShippingAddress | null;
  onDone: () => void;
  onCancel: () => void;
};

const EMPTY: ShippingAddress = { address: '', city: '', state: '', zip: '' };

/** Saves a new card to the signed-in buyer's profile: Stripe tokenises it, only the token is sent. */
export function AddCardForm({ shipping, onDone, onCancel }: Props) {
  const tokenize = useCardTokenizer();
  const save = useAddCard();
  const [holder, setHolder] = useState('');
  const [sameAsShipping, setSameAsShipping] = useState(shipping !== null);
  const [billing, setBilling] = useState(EMPTY);
  const [cardComplete, setCardComplete] = useState(false);
  const [errors, setErrors] = useState<BillingErrors & { card?: string }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [isTokenizing, setIsTokenizing] = useState(false);

  const submit = async () => {
    const address = sameAsShipping && shipping ? shipping : billing;
    const found: BillingErrors & { card?: string } = validateBilling({ ...address, holder });
    if (!cardComplete) found.card = 'Enter your full card details.';
    setErrors(found);
    setFailure(null);
    if (hasFormErrors(found)) return;

    setIsTokenizing(true);
    try {
      const token = await tokenize(holder);
      save.mutate({ token, billing: { ...address, holder: holder.trim() } }, { onSuccess: onDone });
    } catch (error) {
      setFailure(toUserMessage(error));
    } finally {
      setIsTokenizing(false);
    }
  };

  return (
    <View className="gap-[16px] rounded-[16px] border border-[#EEF0F3] p-md">
      <TextField
        label="Name on card"
        icon="user"
        required
        value={holder}
        onChangeText={setHolder}
        error={errors.holder}
        autoComplete="cc-name"
        autoCapitalize="words"
      />
      <CardInput onCompleteChange={setCardComplete} disabled={isTokenizing || save.isPending} />
      {errors.card ? (
        <Text className="font-inter text-[12.5px] text-danger">{errors.card}</Text>
      ) : null}
      {shipping ? (
        <CheckboxRow checked={sameAsShipping} onToggle={() => setSameAsShipping((value) => !value)}>
          Billing address is the same as shipping
        </CheckboxRow>
      ) : null}
      {sameAsShipping && shipping ? null : (
        <AddressFields kind="billing" value={billing} onChange={setBilling} errors={errors} />
      )}
      {failure || save.error ? (
        <FormBanner tone="error" message={failure ?? toUserMessage(save.error)} />
      ) : null}
      <SubmitButton label="Save card" onPress={submit} isLoading={isTokenizing || save.isPending} />
      <SubmitButton label="Cancel" variant="outline" onPress={onCancel} />
    </View>
  );
}
