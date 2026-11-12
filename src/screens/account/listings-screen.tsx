import { Text, View } from 'react-native';

import { InfoCard, StatusChip } from '@/components/account/account-parts';
import { PagedList } from '@/components/account/paged-list';
import { ProductImage } from '@/components/catalog/product-image';
import { useMyListings } from '@/hooks/use-account-data';
import type { SellerListing } from '@/types/account';
import { formatMoney } from '@/utils/home-format';

function ListingCard({ listing }: { listing: SellerListing }) {
  return (
    <InfoCard>
      <View className="flex-row gap-[12px]">
        <View
          className="h-[64px] w-[64px] overflow-hidden rounded-[12px] bg-chip"
          style={{ isolation: 'isolate' }}
        >
          <ProductImage
            uri={listing.imageUrl}
            label={listing.name}
            inset={{ top: 4, x: 4, bottom: 4 }}
          />
        </View>
        <View className="flex-1 gap-[4px]">
          <Text className="font-poppins-medium text-[13.5px] text-ink" numberOfLines={2}>
            {listing.name}
          </Text>
          <Text className="font-inter-bold text-[15px] text-ink">
            {formatMoney(listing.price)}
            <Text className="font-inter text-[11.5px] text-muted"> / {listing.unit}</Text>
          </Text>
          <View className="flex-row items-center gap-[8px]">
            <StatusChip
              status={listing.isActive ? 'active' : 'inactive'}
              label={listing.isActive ? 'Active' : 'Inactive'}
            />
            <Text className="font-inter text-[12px] text-muted">
              {listing.stock.toLocaleString('en-US')} in stock
            </Text>
          </View>
        </View>
      </View>
    </InfoCard>
  );
}

/** Seller: the products this account sells. */
export function ListingsScreen() {
  const listings = useMyListings();

  return (
    <PagedList
      data={listings.items}
      keyOf={(listing) => listing.uuid}
      renderItem={(listing) => <ListingCard listing={listing} />}
      summary={`${listings.total.toLocaleString('en-US')} ${listings.total === 1 ? 'listing' : 'listings'}`}
      isLoading={listings.isLoading}
      isRefreshing={listings.isRefreshing}
      isLoadingMore={listings.isLoadingMore}
      error={listings.error}
      emptyTitle="No listings yet"
      emptyMessage="Products you list for sale will show up here."
      onLoadMore={listings.loadMore}
      onRefresh={listings.refresh}
    />
  );
}
