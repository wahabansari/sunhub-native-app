import { Redirect } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormBanner } from '@/components/forms/form-banner';
import { SubmitButton } from '@/components/forms/submit-button';
import { ListingHeader } from '@/components/listing/listing-header';
import { useAuth } from '@/hooks/use-auth';
import { useGoBack } from '@/hooks/use-go-back';

function titleCase(value: string): string {
  return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function AccountScreen() {
  const goBack = useGoBack();
  const insets = useSafeAreaInsets();
  const { state, signOut } = useAuth();
  const { user } = state;

  if (state.status === 'unauthenticated') return <Redirect href="/login" />;

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Sunhub member';

  return (
    <View className="flex-1 bg-white">
      <ListingHeader title="My account" onBack={goBack} />
      <View className="gap-[16px] px-md pt-lg" style={{ paddingBottom: insets.bottom + 24 }}>
        <View className="gap-[4px] rounded-[16px] bg-surface p-md">
          <Text className="font-poppins-semibold text-[18px] text-ink">{name}</Text>
          {user?.email ? (
            <Text className="font-inter text-[14px] text-muted">{user.email}</Text>
          ) : null}
          {user?.roles.length ? (
            <Text className="pt-[6px] font-inter-medium text-[12.5px] text-ink-soft">
              {user.roles.map(titleCase).join(' · ')}
            </Text>
          ) : null}
        </View>
        {state.error ? <FormBanner tone="error" message={state.error} /> : null}
        <SubmitButton
          label="Sign out"
          variant="outline"
          onPress={() => void signOut()}
          isLoading={state.isSubmitting}
        />
      </View>
    </View>
  );
}
