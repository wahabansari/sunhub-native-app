import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MenuRow, StatusChip } from '@/components/account/account-parts';
import { FormBanner } from '@/components/forms/form-banner';
import { SubmitButton } from '@/components/forms/submit-button';
import { useAuth } from '@/hooks/use-auth';
import { isCustomer, isSeller, roleLabel } from '@/utils/roles';

import { AccountPage } from './account-page';

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View>
      <Text className="pb-[2px] font-inter-semibold text-[12px] uppercase tracking-[0.6px] text-muted">
        {title}
      </Text>
      {children}
    </View>
  );
}

/**
 * The account home. What it lists depends on the account's roles: buyers get their purchases,
 * sellers get their listings and sales, and an account that is both gets everything.
 */
export function AccountHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, signOut } = useAuth();
  const user = state.user;
  const roles = user?.roles ?? [];
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Sunhub member';

  return (
    <AccountPage title="My account">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 22, paddingBottom: insets.bottom + 24 }}
      >
        <View className="flex-row items-center gap-[14px] rounded-[18px] bg-surface p-md">
          <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-primary">
            <Text className="font-poppins-semibold text-[20px] text-white">
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1 gap-[4px]">
            <Text className="font-poppins-semibold text-[17px] text-ink" numberOfLines={1}>
              {name}
            </Text>
            {user?.email ? (
              <Text className="font-inter text-[13px] text-muted" numberOfLines={1}>
                {user.email}
              </Text>
            ) : null}
            <StatusChip status="active" label={roleLabel(roles)} />
          </View>
        </View>

        {isCustomer(roles) ? (
          <Group title="Buying">
            <MenuRow
              icon="cart"
              label="My purchases"
              hint="Orders you have placed"
              onPress={() => router.push('/account/orders')}
            />
          </Group>
        ) : null}

        {isSeller(roles) ? (
          <Group title="Selling">
            <MenuRow
              icon="layers"
              label="My listings"
              hint="Products you sell"
              onPress={() => router.push('/account/listings')}
            />
            <MenuRow
              icon="trend"
              label="Sold items"
              hint="Orders from your buyers"
              onPress={() => router.push('/account/sales')}
            />
          </Group>
        ) : null}

        <Group title="Account">
          <MenuRow
            icon="user"
            label="Account settings"
            hint="Profile and password"
            onPress={() => router.push('/account/settings')}
          />
          <MenuRow
            icon="pin"
            label="Saved addresses"
            onPress={() => router.push('/account/addresses')}
          />
          <MenuRow icon="lock" label="Saved cards" onPress={() => router.push('/account/cards')} />
        </Group>

        {state.error ? <FormBanner tone="error" message={state.error} /> : null}
        <SubmitButton
          label="Sign out"
          variant="outline"
          onPress={() => void signOut()}
          isLoading={state.isSubmitting}
        />
      </ScrollView>
    </AccountPage>
  );
}
