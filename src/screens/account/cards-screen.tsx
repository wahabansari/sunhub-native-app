import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmRemove, InfoCard } from '@/components/account/account-parts';
import { AddCardForm } from '@/components/checkout/add-card-form';
import { FormBanner } from '@/components/forms/form-banner';
import { EmptyState } from '@/components/listing/empty-state';
import { Bone, SkeletonPulse } from '@/components/motion/bone';
import { toUserMessage } from '@/errors';
import { useDeleteCard } from '@/hooks/use-account-data';
import { useAuth } from '@/hooks/use-auth';
import { useSavedProfile } from '@/hooks/use-saved-profile';

import { AccountPage } from './account-page';

/** Saved cards: view, add and remove. Only the brand and last four digits are ever shown. */
export function CardsScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useAuth();
  const profile = useSavedProfile(state.status === 'authenticated');
  const remove = useDeleteCard();
  const [adding, setAdding] = useState(false);

  return (
    <AccountPage title="Saved cards">
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
        {!profile.isLoading && !profile.error && !profile.cards.length && !adding ? (
          <EmptyState
            icon="cart"
            title="No saved cards"
            message="Add a card to check out faster."
          />
        ) : null}
        {profile.cards.map((card) => (
          <InfoCard key={card.id}>
            <Text className="font-poppins-medium text-[14px] text-ink">
              {card.brand} ending in {card.last4}
            </Text>
            <Text className="font-inter text-[12.5px] text-muted">
              {[card.holder, card.expiration ? `Expires ${card.expiration}` : '']
                .filter(Boolean)
                .join(' · ')}
            </Text>
            {card.billingSummary ? (
              <Text className="font-inter text-[12px] text-muted">{card.billingSummary}</Text>
            ) : null}
            <ConfirmRemove onConfirm={() => remove.mutate(card.id)} isBusy={remove.isPending} />
          </InfoCard>
        ))}
        {adding ? (
          <AddCardForm
            shipping={null}
            onDone={() => setAdding(false)}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <View className="pt-[4px]">
            <Pressable onPress={() => setAdding(true)} hitSlop={8} accessibilityRole="button">
              <Text className="font-poppins-semibold text-[14px] text-primary">
                + Add a new card
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </AccountPage>
  );
}
