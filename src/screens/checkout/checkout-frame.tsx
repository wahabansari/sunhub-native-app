import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormBanner } from '@/components/forms/form-banner';
import { SubmitButton } from '@/components/forms/submit-button';
import { ListingHeader } from '@/components/listing/listing-header';
import { useGoBack } from '@/hooks/use-go-back';
import { formatMoney } from '@/utils/home-format';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-[12px]">
      <Text accessibilityRole="header" className="font-poppins-semibold text-[16px] text-ink">
        {title}
      </Text>
      {children}
    </View>
  );
}

type Props = {
  children: ReactNode;
  total: number | undefined;
  isPlacing: boolean;
  canPlace: boolean;
  error: string | null;
  notice: string | null;
  onPlaceOrder: () => void;
};

/** Header, scrolling form and the pinned total with the Place order button. */
export function CheckoutFrame({
  children,
  total,
  isPlacing,
  canPlace,
  error,
  notice,
  onPlaceOrder,
}: Props) {
  const goBack = useGoBack();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ListingHeader title="Checkout" onBack={goBack} />
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 24 }}
      >
        {children}
      </ScrollView>
      <View
        className="gap-[10px] border-t border-[#EEF0F3] bg-white px-md pt-[12px]"
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
      >
        {error ? <FormBanner tone="error" message={error} /> : null}
        {notice ? <FormBanner tone="info" message={notice} /> : null}
        <SubmitButton
          label={total !== undefined ? `Place order · ${formatMoney(total)}` : 'Place order'}
          onPress={canPlace ? onPlaceOrder : () => undefined}
          isLoading={isPlacing}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
