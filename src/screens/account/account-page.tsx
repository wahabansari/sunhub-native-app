import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { EmptyState } from '@/components/listing/empty-state';
import { ListingHeader } from '@/components/listing/listing-header';
import { useAuth } from '@/hooks/use-auth';
import { useGoBack } from '@/hooks/use-go-back';
import { isCustomer, isSeller } from '@/utils/roles';

type Props = {
  title: string;
  /** Limits the page to buyers or sellers; a signed-in user without that role sees a notice. */
  role?: 'buyer' | 'seller';
  children: ReactNode;
};

/** Frame for every account page: header, sign-in check and the buyer/seller role check. */
export function AccountPage({ title, role, children }: Props) {
  const goBack = useGoBack();
  const { state } = useAuth();

  if (state.status === 'unauthenticated') return <Redirect href="/login" />;

  const roles = state.user?.roles ?? [];
  const allowed = !role || (role === 'seller' ? isSeller(roles) : isCustomer(roles));

  return (
    <View className="flex-1 bg-white">
      <ListingHeader title={title} onBack={goBack} />
      {state.status === 'initializing' ? null : allowed ? (
        children
      ) : (
        <EmptyState
          icon="user"
          title={role === 'seller' ? 'Seller account needed' : 'Buyer account needed'}
          message={
            role === 'seller'
              ? 'This page is for sellers. Your account is not set up to sell yet.'
              : 'This page is for buyers. Your account is not set up to buy yet.'
          }
          actionLabel="Back"
          onAction={goBack}
        />
      )}
    </View>
  );
}
