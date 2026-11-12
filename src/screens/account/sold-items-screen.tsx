import { Text, View } from 'react-native';

import { InfoCard, StatusChip } from '@/components/account/account-parts';
import { PagedList } from '@/components/account/paged-list';
import { useSoldItems } from '@/hooks/use-account-data';
import type { SoldItem } from '@/types/account';
import { formatDate } from '@/utils/dates';
import { formatMoney } from '@/utils/home-format';

function SaleCard({ sale }: { sale: SoldItem }) {
  return (
    <InfoCard>
      <View className="flex-row items-start justify-between gap-[8px]">
        <View className="flex-1">
          <Text className="font-poppins-semibold text-[14.5px] text-ink" numberOfLines={1}>
            {sale.customer}
          </Text>
          <Text className="font-inter text-[12px] text-muted">
            Order #{sale.id}
            {sale.date ? ` · ${formatDate(sale.date)}` : ''}
          </Text>
        </View>
        <StatusChip status={sale.status} />
      </View>
      {sale.shippingType ? (
        <Text className="font-inter text-[12.5px] text-ink-soft">
          {sale.shippingType.replace(/[_-]+/g, ' ')} · shipping {formatMoney(sale.shipping)}
        </Text>
      ) : null}
      <View className="flex-row items-baseline justify-between pt-[4px]">
        <Text className="font-inter text-[12px] text-muted">Order total</Text>
        <Text className="font-inter-bold text-[16px] text-ink">{formatMoney(sale.total)}</Text>
      </View>
    </InfoCard>
  );
}

/** Seller: orders this account has sold. */
export function SoldItemsScreen() {
  const sales = useSoldItems();

  return (
    <PagedList
      data={sales.items}
      keyOf={(sale) => sale.id}
      renderItem={(sale) => <SaleCard sale={sale} />}
      summary={`${sales.total.toLocaleString('en-US')} ${sales.total === 1 ? 'sale' : 'sales'}`}
      isLoading={sales.isLoading}
      isRefreshing={sales.isRefreshing}
      isLoadingMore={sales.isLoadingMore}
      error={sales.error}
      emptyTitle="No sales yet"
      emptyMessage="Orders from your buyers will show up here."
      onLoadMore={sales.loadMore}
      onRefresh={sales.refresh}
    />
  );
}
