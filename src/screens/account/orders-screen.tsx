import { Text, View } from 'react-native';

import { InfoCard, StatusChip } from '@/components/account/account-parts';
import { PagedList } from '@/components/account/paged-list';
import { useOrders } from '@/hooks/use-account-data';
import type { OrderSummary } from '@/types/account';
import { formatDate } from '@/utils/dates';
import { formatMoney } from '@/utils/home-format';

const VISIBLE_LINES = 2;

function OrderCard({ order }: { order: OrderSummary }) {
  const extra = order.lines.length - VISIBLE_LINES;

  return (
    <InfoCard>
      <View className="flex-row items-start justify-between gap-[8px]">
        <View className="flex-1">
          <Text className="font-poppins-semibold text-[14.5px] text-ink">
            {order.number ? `Order #${order.number}` : 'Order'}
          </Text>
          <Text className="font-inter text-[12px] text-muted">{formatDate(order.date)}</Text>
        </View>
        <StatusChip status={order.status} />
      </View>
      {order.lines.slice(0, VISIBLE_LINES).map((line, index) => (
        <Text
          key={`${line.name}-${index}`}
          className="font-inter text-[13px] text-ink-soft"
          numberOfLines={1}
        >
          {line.qty} × {line.name}
        </Text>
      ))}
      {extra > 0 ? <Text className="font-inter text-[12px] text-muted">+ {extra} more</Text> : null}
      <View className="flex-row items-baseline justify-between pt-[4px]">
        <Text className="font-inter text-[12px] text-muted">Total</Text>
        <Text className="font-inter-bold text-[16px] text-ink">{formatMoney(order.total)}</Text>
      </View>
    </InfoCard>
  );
}

/** Buyer: the orders placed from this account. */
export function OrdersScreen() {
  const orders = useOrders();

  return (
    <PagedList
      data={orders.items}
      keyOf={(order) => order.id}
      renderItem={(order) => <OrderCard order={order} />}
      summary={`${orders.total.toLocaleString('en-US')} ${orders.total === 1 ? 'order' : 'orders'}`}
      isLoading={orders.isLoading}
      isRefreshing={orders.isRefreshing}
      isLoadingMore={orders.isLoadingMore}
      error={orders.error}
      emptyTitle="No purchases yet"
      emptyMessage="Orders you place will show up here."
      onLoadMore={orders.loadMore}
      onRefresh={orders.refresh}
    />
  );
}
