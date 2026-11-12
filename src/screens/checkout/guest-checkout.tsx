import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AddressFields } from '@/components/checkout/address-fields';
import { CardInput } from '@/components/checkout/card-input';
import { CheckboxRow } from '@/components/forms/checkbox-row';
import { TextField } from '@/components/forms/text-field';
import { useToast } from '@/components/feedback/toast';
import { sameAddress, useCheckoutPricing } from '@/hooks/use-checkout-pricing';
import { useCardTokenizer } from '@/hooks/use-card-tokenizer';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { checkoutService } from '@/services/cart';
import { isCardEntryAvailable } from '@/services/payments/stripe';
import type { Cart, GuestContact, ShippingAddress } from '@/types/cart';
import { formatUsPhone } from '@/utils/auth-links';
import {
  isCompleteAddress,
  validateAddress,
  validateBilling,
  validateContact,
  type AddressErrors,
  type BillingErrors,
  type ContactErrors,
} from '@/validation/checkout';
import { hasFormErrors } from '@/validation/auth';

import { CheckoutFrame, Section } from './checkout-frame';
import { DeliverySection } from './delivery-section';

const EMPTY_CONTACT: GuestContact = { firstName: '', lastName: '', email: '', phone: '' };
const EMPTY_ADDRESS: ShippingAddress = { address: '', city: '', state: '', zip: '' };
const ADDRESS_SETTLE_MS = 700;

/** Checkout for a buyer who is not signed in: contact, address and a card, held only in memory. */
export function GuestCheckout({ cart }: { cart: Cart }) {
  const toast = useToast();
  const tokenize = useCardTokenizer();
  const [contact, setContact] = useState(EMPTY_CONTACT);
  const [shipping, setShipping] = useState(EMPTY_ADDRESS);
  const [sameBilling, setSameBilling] = useState(true);
  const [billing, setBilling] = useState(EMPTY_ADDRESS);
  const [holder, setHolder] = useState('');
  const [cardComplete, setCardComplete] = useState(false);
  const [errors, setErrors] = useState<{
    contact: ContactErrors;
    shipping: AddressErrors;
    billing: BillingErrors;
    card?: string;
  }>({ contact: {}, shipping: {}, billing: {} });

  const settled = useDebouncedValue(shipping, ADDRESS_SETTLE_MS);
  const priced = isCompleteAddress(settled) ? settled : null;
  const pricing = useCheckoutPricing(cart, priced);
  const { order, totals } = pricing;

  const submit = () => {
    if (!isCardEntryAvailable()) {
      toast.show('Card payments are not available in this build.', 'error');
      return;
    }
    const found = {
      contact: validateContact(contact),
      shipping: validateAddress(shipping),
      billing: sameBilling ? ({} as BillingErrors) : validateBilling({ ...billing, holder }),
      card: undefined as string | undefined,
    };
    if (!holder.trim()) found.billing = { ...found.billing, holder: 'Enter the name on the card.' };
    if (!cardComplete) found.card = 'Enter your full card details.';
    setErrors(found);

    if (
      hasFormErrors(found.contact) ||
      hasFormErrors(found.shipping) ||
      hasFormErrors(found.billing) ||
      found.card
    ) {
      toast.show('Please fix the highlighted fields.', 'error');
      return;
    }
    if (!sameAddress(priced, shipping) || !pricing.isPriced) {
      toast.show('Hold on, we are still pricing your order.', 'error');
      return;
    }

    void order.place(async () => {
      const card = await tokenize(holder);
      return checkoutService.placeGuestOrder({
        contact: { ...contact, email: contact.email.trim() },
        shipping,
        billing: { ...(sameBilling ? shipping : billing), holder },
        card,
      });
    });
  };

  const setField = <Key extends keyof GuestContact>(key: Key, value: GuestContact[Key]) =>
    setContact((previous) => ({ ...previous, [key]: value }));

  return (
    <CheckoutFrame
      total={totals.totals?.total}
      isPlacing={order.isPlacing}
      canPlace={!order.isPlacing}
      error={order.error}
      notice={order.notice}
      onPlaceOrder={submit}
    >
      <Section title="Contact">
        <TextField
          label="First name"
          placeholder="Enter your first name"
          icon="user"
          required
          value={contact.firstName}
          onChangeText={(value) => setField('firstName', value)}
          error={errors.contact.firstName}
          autoComplete="given-name"
          textContentType="givenName"
          autoCapitalize="words"
        />
        <TextField
          label="Last name"
          placeholder="Enter your last name"
          icon="user"
          required
          value={contact.lastName}
          onChangeText={(value) => setField('lastName', value)}
          error={errors.contact.lastName}
          autoComplete="family-name"
          textContentType="familyName"
          autoCapitalize="words"
        />
        <TextField
          label="Email"
          placeholder="name@example.com"
          icon="mail"
          required
          value={contact.email}
          onChangeText={(value) => setField('email', value)}
          error={errors.contact.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <TextField
          label="Phone"
          icon="phone"
          required
          prefix="+1"
          value={contact.phone}
          onChangeText={(value) => setField('phone', formatUsPhone(value))}
          error={errors.contact.phone}
          placeholder="(xxx) xxx-xxxx"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
      </Section>
      <Section title="Shipping address">
        <AddressFields
          kind="shipping"
          value={shipping}
          onChange={setShipping}
          errors={errors.shipping}
        />
      </Section>
      <DeliverySection cart={cart} pricing={pricing} hasAddress={priced !== null} />
      <Section title="Payment">
        <TextField
          label="Name on card"
          placeholder="Name as shown on the card"
          icon="user"
          required
          value={holder}
          onChangeText={setHolder}
          error={errors.billing.holder}
          autoComplete="cc-name"
          textContentType="name"
          autoCapitalize="words"
        />
        <CardInput onCompleteChange={setCardComplete} disabled={order.isPlacing} />
        {errors.card && isCardEntryAvailable() ? (
          <Text className="font-inter text-[12.5px] text-danger">{errors.card}</Text>
        ) : null}
        <CheckboxRow checked={sameBilling} onToggle={() => setSameBilling((value) => !value)}>
          Billing address is the same as shipping
        </CheckboxRow>
        {sameBilling ? null : (
          <View className="gap-[4px]">
            <AddressFields
              kind="billing"
              value={billing}
              onChange={setBilling}
              errors={errors.billing}
            />
          </View>
        )}
        <Pressable accessibilityRole="text" className="pt-[2px]">
          <Text className="font-inter text-[12px] leading-[17px] text-muted">
            Your details are used only to place this order and are not saved on this device.
          </Text>
        </Pressable>
      </Section>
    </CheckoutFrame>
  );
}
