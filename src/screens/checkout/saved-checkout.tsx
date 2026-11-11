import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AddAddressForm } from '@/components/checkout/add-address-form';
import { AddCardForm } from '@/components/checkout/add-card-form';
import { SavedAddressList, SavedCardList } from '@/components/checkout/saved-lists';
import { useToast } from '@/components/feedback/toast';
import { FormBanner } from '@/components/forms/form-banner';
import { TextField } from '@/components/forms/text-field';
import { Bone, SkeletonPulse } from '@/components/motion/bone';
import { useAuth } from '@/hooks/use-auth';
import { useCheckoutPricing } from '@/hooks/use-checkout-pricing';
import { useSavedProfile } from '@/hooks/use-saved-profile';
import { checkoutService } from '@/services/cart';
import type { Cart } from '@/types/cart';
import { formatUsPhone } from '@/utils/auth-links';
import { isUsStateCode } from '@/validation/checkout';
import { isValidUsPhone } from '@/utils/validation';

import { CheckoutFrame, Section } from './checkout-frame';
import { DeliverySection } from './delivery-section';

function ListSkeleton() {
  return (
    <SkeletonPulse>
      <View className="gap-[10px]">
        <Bone className="h-[64px] w-full rounded-[14px]" />
        <Bone className="h-[64px] w-full rounded-[14px]" />
      </View>
    </SkeletonPulse>
  );
}

function AddLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" className="self-start">
      <Text className="font-poppins-semibold text-[13.5px] text-primary">{label}</Text>
    </Pressable>
  );
}

/** Checkout for a signed-in buyer: pick a saved address and card, or add new ones. */
export function SavedCheckout({ cart }: { cart: Cart }) {
  const toast = useToast();
  const { state } = useAuth();
  const profile = useSavedProfile(true);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const [phoneEdit, setPhoneEdit] = useState<string | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addingCard, setAddingCard] = useState(false);

  // Until the buyer picks one, the first saved address and card are used.
  const address = profile.addresses.find((entry) => entry.id === addressId) ?? profile.addresses[0];
  const card = profile.cards.find((entry) => entry.id === cardId) ?? profile.cards[0];
  const phone = phoneEdit ?? address?.phone ?? '';
  const priceable = address && isUsStateCode(address.state) ? address : null;

  const pricing = useCheckoutPricing(cart, priceable);
  const { order, totals } = pricing;
  const fullName = [state.user?.firstName, state.user?.lastName].filter(Boolean).join(' ');

  const submit = () => {
    if (!address || !card) {
      toast.show('Choose a shipping address and a card.', 'error');
      return;
    }
    if (!isValidUsPhone(phone)) {
      toast.show('Enter a valid phone number for delivery.', 'error');
      return;
    }
    if (!pricing.isPriced) {
      toast.show('Hold on, we are still pricing your order.', 'error');
      return;
    }
    void order.place(() =>
      checkoutService.placeSavedOrder({ addressId: address.id, cardId: card.id, phone }),
    );
  };

  return (
    <CheckoutFrame
      total={totals.totals?.total}
      isPlacing={order.isPlacing}
      canPlace={!order.isPlacing}
      error={order.error}
      notice={order.notice}
      onPlaceOrder={submit}
    >
      {profile.error ? <FormBanner tone="error" message={profile.error} /> : null}
      <Section title="Shipping address">
        {profile.isLoading ? <ListSkeleton /> : null}
        {!profile.isLoading && profile.addresses.length ? (
          <SavedAddressList
            addresses={profile.addresses}
            selectedId={address?.id ?? null}
            onSelect={(entry) => {
              setAddressId(entry.id);
              setPhoneEdit(null);
            }}
          />
        ) : null}
        {addingAddress ? (
          <AddAddressForm
            email={state.user?.email ?? ''}
            defaultName={fullName}
            onDone={() => setAddingAddress(false)}
            onCancel={() => setAddingAddress(false)}
          />
        ) : (
          <AddLink label="+ Add a new address" onPress={() => setAddingAddress(true)} />
        )}
        <TextField
          label="Phone for delivery"
          icon="phone"
          required
          prefix="+1"
          value={formatUsPhone(phone)}
          onChangeText={(value) => setPhoneEdit(formatUsPhone(value))}
          placeholder="(xxx) xxx-xxxx"
          keyboardType="phone-pad"
          autoComplete="tel"
        />
      </Section>
      <DeliverySection cart={cart} pricing={pricing} hasAddress={priceable !== null} />
      <Section title="Payment">
        {profile.isLoading ? <ListSkeleton /> : null}
        {!profile.isLoading && profile.cards.length ? (
          <SavedCardList
            cards={profile.cards}
            selectedId={card?.id ?? null}
            onSelect={(entry) => setCardId(entry.id)}
          />
        ) : null}
        {addingCard ? (
          <AddCardForm
            shipping={priceable}
            onDone={() => setAddingCard(false)}
            onCancel={() => setAddingCard(false)}
          />
        ) : (
          <AddLink label="+ Add a new card" onPress={() => setAddingCard(true)} />
        )}
      </Section>
    </CheckoutFrame>
  );
}
