import { View } from 'react-native';

import { TextField } from '@/components/forms/text-field';
import type { ShippingAddress } from '@/types/cart';
import type { AddressErrors } from '@/validation/checkout';

import { StatePicker } from './state-picker';

type Props = {
  value: ShippingAddress;
  onChange: (next: ShippingAddress) => void;
  errors?: AddressErrors;
  /** Which autofill hint group these fields belong to. */
  kind: 'shipping' | 'billing';
};

/** Street, city, state and ZIP for a US address. */
export function AddressFields({ value, onChange, errors = {}, kind }: Props) {
  const set = <Key extends keyof ShippingAddress>(key: Key, next: ShippingAddress[Key]) =>
    onChange({ ...value, [key]: next });
  const hint = kind === 'shipping' ? 'shipping' : 'billing';

  return (
    <View className="gap-[16px]">
      <TextField
        label="Street address"
        placeholder="Street and number"
        icon="pin"
        required
        value={value.address}
        onChangeText={(text) => set('address', text)}
        error={errors.address}
        autoComplete={`${hint}-street-address` as never}
        textContentType="streetAddressLine1"
        autoCapitalize="words"
      />
      <TextField
        label="City"
        placeholder="Enter your city"
        icon="building"
        required
        value={value.city}
        onChangeText={(text) => set('city', text)}
        error={errors.city}
        textContentType="addressCity"
        autoCapitalize="words"
      />
      <StatePicker
        value={value.state}
        onChange={(code) => set('state', code)}
        error={errors.state}
      />
      <TextField
        label="ZIP code"
        placeholder="5-digit ZIP code"
        icon="pin"
        required
        value={value.zip}
        onChangeText={(text) => set('zip', text.replace(/\D/g, '').slice(0, 5))}
        error={errors.zip}
        keyboardType="number-pad"
        autoComplete="postal-code"
        textContentType="postalCode"
        maxLength={5}
      />
    </View>
  );
}
