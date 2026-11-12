import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmRemove, InfoCard } from '@/components/account/account-parts';
import { AddAddressForm } from '@/components/checkout/add-address-form';
import { FormBanner } from '@/components/forms/form-banner';
import { EmptyState } from '@/components/listing/empty-state';
import { Bone, SkeletonPulse } from '@/components/motion/bone';
import { toUserMessage } from '@/errors';
import { useDeleteAddress } from '@/hooks/use-account-data';
import { useAuth } from '@/hooks/use-auth';
import { useSavedProfile } from '@/hooks/use-saved-profile';

import { AccountPage } from './account-page';

/** Saved shipping addresses: view, add and remove. */
export function AddressesScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useAuth();
  const profile = useSavedProfile(state.status === 'authenticated');
  const remove = useDeleteAddress();
  const [adding, setAdding] = useState(false);
  const fullName = [state.user?.firstName, state.user?.lastName].filter(Boolean).join(' ');

  return (
    <AccountPage title="Saved addresses">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}
      >
        {profile.isLoading ? (
          <SkeletonPulse>
            <Bone className="h-[72px] w-full rounded-[16px]" />
          </SkeletonPulse>
        ) : null}
        {profile.error ? <FormBanner tone="error" message={profile.error} /> : null}
        {remove.error ? <FormBanner tone="error" message={toUserMessage(remove.error)} /> : null}
        {!profile.isLoading && !profile.error && !profile.addresses.length && !adding ? (
          <EmptyState
            icon="pin"
            title="No saved addresses"
            message="Add one to check out faster."
          />
        ) : null}
        {profile.addresses.map((address) => (
          <InfoCard key={address.id}>
            {address.name ? (
              <Text className="font-poppins-medium text-[14px] text-ink">{address.name}</Text>
            ) : null}
            <Text className="font-inter text-[13px] leading-[18px] text-ink-soft">
              {address.address}, {address.city}, {address.state} {address.zip}
            </Text>
            <ConfirmRemove onConfirm={() => remove.mutate(address.id)} isBusy={remove.isPending} />
          </InfoCard>
        ))}
        {adding ? (
          <AddAddressForm
            email={state.user?.email ?? ''}
            defaultName={fullName}
            onDone={() => setAdding(false)}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <View className="pt-[4px]">
            <Pressable onPress={() => setAdding(true)} hitSlop={8} accessibilityRole="button">
              <Text className="font-poppins-semibold text-[14px] text-primary">
                + Add a new address
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </AccountPage>
  );
}
