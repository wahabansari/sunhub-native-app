import { Redirect, useRouter } from 'expo-router';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { View } from 'react-native';

import { EmptyState } from '@/components/listing/empty-state';
import { ListingHeader } from '@/components/listing/listing-header';
import { Bone, SkeletonPulse } from '@/components/motion/bone';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useGoBack } from '@/hooks/use-go-back';

import { GuestCheckout } from './guest-checkout';
import { SavedCheckout } from './saved-checkout';

function CheckoutSkeleton() {
  return (
    <SkeletonPulse>
      <View className="gap-[14px] p-md">
        <Bone className="h-[16px] w-[120px] rounded-full" />
        <Bone className="h-[50px] w-full rounded-[14px]" />
        <Bone className="h-[50px] w-full rounded-[14px]" />
        <Bone className="h-[50px] w-full rounded-[14px]" />
      </View>
    </SkeletonPulse>
  );
}

/**
 * Checkout entry: guests and signed-in buyers share the cart and pricing, but use different forms.
 * Screenshots and screen recordings are blocked here because the screen shows personal and card details.
 */
export function CheckoutScreen() {
  usePreventScreenCapture();
  const router = useRouter();
  const goBack = useGoBack();
  const { state } = useAuth();
  const { cart, isLoading, error, refetch } = useCart();

  if (state.status === 'initializing' || isLoading) {
    return (
      <View className="flex-1 bg-white">
        <ListingHeader title="Checkout" onBack={goBack} />
        <CheckoutSkeleton />
      </View>
    );
  }

  if (error && !cart) {
    return (
      <View className="flex-1 bg-white">
        <ListingHeader title="Checkout" onBack={goBack} />
        <EmptyState
          icon="bell"
          title="Could not load your cart"
          message={error}
          actionLabel="Try again"
          onAction={refetch}
        />
      </View>
    );
  }

  if (!cart || cart.itemCount === 0) {
    return (
      <View className="flex-1 bg-white">
        <ListingHeader title="Checkout" onBack={goBack} />
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          message="Add products before checking out."
          actionLabel="Browse products"
          onAction={() => router.replace('/products')}
        />
      </View>
    );
  }

  // Unavailable items must be removed in the cart first.
  if (cart.hasOutOfStock) return <Redirect href="/cart" />;

  return state.status === 'authenticated' ? (
    <SavedCheckout cart={cart} />
  ) : (
    <GuestCheckout cart={cart} />
  );
}
