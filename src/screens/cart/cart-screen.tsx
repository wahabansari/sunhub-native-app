import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartItemRow } from '@/components/cart/cart-item-row';
import { FormBanner } from '@/components/forms/form-banner';
import { SubmitButton } from '@/components/forms/submit-button';
import { EmptyState } from '@/components/listing/empty-state';
import { ListingHeader } from '@/components/listing/listing-header';
import { Bone, SkeletonPulse } from '@/components/motion/bone';
import { useCart, useCartActions } from '@/hooks/use-cart';
import { useGoBack } from '@/hooks/use-go-back';
import type { CartItem } from '@/types/cart';
import { formatMoney } from '@/utils/home-format';

function CartSkeleton() {
  return (
    <SkeletonPulse>
      <View className="gap-[18px] px-md pt-md">
        {[0, 1, 2].map((row) => (
          <View key={row} className="flex-row gap-[12px]">
            <Bone className="h-[88px] w-[88px] rounded-[14px]" />
            <View className="flex-1 gap-[8px]">
              <Bone className="h-[14px] w-full rounded-full" />
              <Bone className="h-[14px] w-[60%] rounded-full" />
              <Bone className="mt-[8px] h-[34px] w-[70%] rounded-full" />
            </View>
          </View>
        ))}
      </View>
    </SkeletonPulse>
  );
}

export function CartScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const insets = useSafeAreaInsets();
  const { cart, isLoading, isRefreshing, error, refetch } = useCart();
  const { changeQuantity, removeItem, clearCart } = useCartActions();
  const [confirmingClear, setConfirmingClear] = useState(false);

  const items = cart?.items ?? [];
  const canCheckout = items.length > 0 && !cart?.hasOutOfStock;

  const onQuantity = (item: CartItem, qty: number) =>
    changeQuantity(item.uuid, qty, item.moq, item.stock);

  return (
    <View className="flex-1 bg-white">
      <ListingHeader title="Cart" onBack={goBack} />
      {isLoading ? <CartSkeleton /> : null}
      {!isLoading && error && !items.length ? (
        <EmptyState
          icon="bell"
          title="Could not load your cart"
          message={error}
          actionLabel="Try again"
          onAction={refetch}
        />
      ) : null}
      {!isLoading && !error && !items.length ? (
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          message="Add products and they will show up here."
          actionLabel="Browse products"
          onAction={() => router.replace('/products')}
        />
      ) : null}
      {items.length ? (
        <>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} />}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          >
            {items.map((item) => (
              <View key={item.uuid} className="border-b border-[#EEF0F3]">
                <CartItemRow
                  item={item}
                  onQuantityChange={onQuantity}
                  onRemove={(entry) => removeItem(entry.uuid)}
                />
              </View>
            ))}
            <View className="items-start pt-[14px]">
              {confirmingClear ? (
                <View className="flex-row items-center gap-[16px]">
                  <Text className="font-inter text-[13px] text-ink-soft">Remove every item?</Text>
                  <Pressable
                    onPress={() => {
                      clearCart();
                      setConfirmingClear(false);
                    }}
                    hitSlop={8}
                    accessibilityRole="button"
                  >
                    <Text className="font-poppins-semibold text-[13px] text-danger">
                      Yes, clear
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setConfirmingClear(false)}
                    hitSlop={8}
                    accessibilityRole="button"
                  >
                    <Text className="font-poppins-medium text-[13px] text-ink-soft">Keep</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => setConfirmingClear(true)}
                  hitSlop={8}
                  accessibilityRole="button"
                >
                  <Text className="font-poppins-medium text-[13px] text-muted">Clear cart</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
          <View
            className="gap-[10px] border-t border-[#EEF0F3] bg-white px-md pt-[12px]"
            style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
          >
            {cart?.hasOutOfStock ? (
              <FormBanner
                tone="info"
                message="Some items are out of stock. Remove them to continue to checkout."
              />
            ) : null}
            <View className="flex-row items-baseline justify-between">
              <Text className="font-inter-medium text-[14px] text-ink-soft">Subtotal</Text>
              <Text className="font-inter-bold text-[20px] text-ink">
                {formatMoney(cart?.subtotal ?? 0)}
              </Text>
            </View>
            <Text className="font-inter text-[12px] text-muted">
              Shipping and tax are calculated at checkout.
            </Text>
            {canCheckout ? (
              <SubmitButton label="Proceed to checkout" onPress={() => router.push('/checkout')} />
            ) : null}
          </View>
        </>
      ) : null}
    </View>
  );
}
