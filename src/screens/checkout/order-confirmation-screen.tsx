import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/icon';
import { SubmitButton } from '@/components/forms/submit-button';
import { LAST_ORDER_KEY } from '@/hooks/use-place-order';
import { colors } from '@/theme/tokens';
import type { PlacedOrder } from '@/types/cart';
import { formatMoney } from '@/utils/home-format';

function Line({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-row items-baseline justify-between">
      <Text className="font-inter text-[14px] text-ink-soft">{label}</Text>
      <Text className="font-inter-medium text-[14px] text-ink">{formatMoney(value)}</Text>
    </View>
  );
}

/** Thank-you screen. The order details live only in memory and are discarded when it closes. */
export function OrderConfirmationScreen() {
  const router = useRouter();
  const client = useQueryClient();
  const insets = useSafeAreaInsets();
  const { data: order } = useQuery<PlacedOrder | undefined>({
    queryKey: LAST_ORDER_KEY,
    queryFn: () => undefined,
    enabled: false,
    staleTime: Infinity,
  });

  useEffect(
    () => () => {
      client.removeQueries({ queryKey: LAST_ORDER_KEY });
    },
    [client],
  );

  return (
    <View
      className="flex-1 items-center justify-center gap-[18px] bg-white px-lg"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
    >
      <View className="h-[84px] w-[84px] items-center justify-center rounded-full bg-[#DCFCE7]">
        <Icon name="check" size={40} color={colors.success} strokeWidth={2.6} />
      </View>
      <Text
        accessibilityRole="header"
        className="text-center font-poppins-semibold text-[24px] text-ink"
      >
        Order placed
      </Text>
      <Text className="text-center font-inter text-[14.5px] leading-[21px] text-muted">
        Thank you for your order.
        {order?.email ? ` A confirmation will be sent to ${order.email}.` : ''}
      </Text>
      {order?.total !== undefined ? (
        <View className="w-full gap-[8px] rounded-[16px] bg-surface p-md">
          {order.shipping !== undefined ? <Line label="Shipping" value={order.shipping} /> : null}
          {order.tax !== undefined ? <Line label="Tax" value={order.tax} /> : null}
          <View className="flex-row items-baseline justify-between pt-[4px]">
            <Text className="font-inter-bold text-[16px] text-ink">Total</Text>
            <Text className="font-inter-bold text-[20px] text-ink">{formatMoney(order.total)}</Text>
          </View>
        </View>
      ) : null}
      <View className="w-full pt-[8px]">
        <SubmitButton label="Continue shopping" onPress={() => router.replace('/products')} />
      </View>
    </View>
  );
}
