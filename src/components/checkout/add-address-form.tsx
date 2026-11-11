import { useState } from 'react';
import { View } from 'react-native';

import { FormBanner } from '@/components/forms/form-banner';
import { SubmitButton } from '@/components/forms/submit-button';
import { TextField } from '@/components/forms/text-field';
import { toUserMessage } from '@/errors';
import { useAddAddress } from '@/hooks/use-saved-profile';
import type { ShippingAddress } from '@/types/cart';
import { formatUsPhone } from '@/utils/auth-links';
import { hasFormErrors } from '@/validation/auth';
import { validateAddress, type AddressErrors } from '@/validation/checkout';
import { isValidUsPhone } from '@/utils/validation';

import { AddressFields } from './address-fields';

type Props = {
  /** Used for the address record; comes from the signed-in profile. */
  email: string;
  defaultName: string;
  onDone: () => void;
  onCancel: () => void;
};

/** Saves a new shipping address to the signed-in buyer's profile. */
export function AddAddressForm({ email, defaultName, onDone, onCancel }: Props) {
  const save = useAddAddress();
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState<ShippingAddress>({
    address: '',
    city: '',
    state: '',
    zip: '',
  });
  const [errors, setErrors] = useState<AddressErrors & { name?: string; phone?: string }>({});

  const submit = () => {
    const found: AddressErrors & { name?: string; phone?: string } = validateAddress(address);
    if (!name.trim()) found.name = 'Enter a name for this address.';
    if (!isValidUsPhone(phone)) found.phone = 'Enter a valid 10-digit phone number.';
    setErrors(found);
    if (hasFormErrors(found)) return;

    save.mutate({ ...address, name: name.trim(), phone, email }, { onSuccess: onDone });
  };

  return (
    <View className="gap-[16px] rounded-[16px] border border-[#EEF0F3] p-md">
      <TextField
        label="Name"
        icon="user"
        required
        value={name}
        onChangeText={setName}
        error={errors.name}
        autoCapitalize="words"
      />
      <TextField
        label="Phone"
        icon="phone"
        required
        prefix="+1"
        value={phone}
        onChangeText={(value) => setPhone(formatUsPhone(value))}
        error={errors.phone}
        placeholder="(xxx) xxx-xxxx"
        keyboardType="phone-pad"
      />
      <AddressFields kind="shipping" value={address} onChange={setAddress} errors={errors} />
      {save.error ? <FormBanner tone="error" message={toUserMessage(save.error)} /> : null}
      <SubmitButton label="Save address" onPress={submit} isLoading={save.isPending} />
      <SubmitButton label="Cancel" variant="outline" onPress={onCancel} />
    </View>
  );
}
