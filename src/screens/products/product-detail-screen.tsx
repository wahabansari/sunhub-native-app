import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { BottomBar, DetailCard, ImageGallery, SpecTable } from '@/components/listing/detail-parts';
import { EmptyState, LoadingState } from '@/components/listing/empty-state';
import { ListingHeader } from '@/components/listing/listing-header';
import { useGoBack } from '@/hooks/use-go-back';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useProductDetail } from '@/hooks/use-product-detail';
import { colors } from '@/theme/tokens';
import type { ProductDetail } from '@/types/listing';
import { formatMoney } from '@/utils/home-format';

function QuantityStepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <View className="h-[44px] flex-row items-center rounded-full border border-[#D1D5DB]">
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        className="h-[42px] w-[42px] items-center justify-center rounded-full active:bg-chip"
      >
        <Icon name="minus" size={18} color={colors.ink} />
      </Pressable>
      <Text className="min-w-[30px] text-center font-inter-semibold text-[16px] text-ink">
        {value}
      </Text>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        className="h-[42px] w-[42px] items-center justify-center rounded-full active:bg-chip"
      >
        <Icon name="plus" size={18} color={colors.ink} />
      </Pressable>
    </View>
  );
}

function ProductBody({ product }: { product: ProductDetail }) {
  const requireAuth = useRequireAuth();
  const max = Math.max(product.moq, product.stock);
  const [quantity, setQuantity] = useState(product.moq);
  const inStock = product.stock > 0;
  const pills = [
    ...(product.sponsorLabel ? [{ label: product.sponsorLabel, tone: 'amber' as const }] : []),
    ...product.badges.map((label) => ({ label, tone: 'blue' as const })),
  ];

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageGallery urls={product.imageUrls} label={product.name} pills={pills} />
        <DetailCard>
          {product.brand ? (
            <Text className="font-inter text-[13px] text-muted">{product.brand}</Text>
          ) : null}
          <Text className="font-poppins-semibold text-[20px] leading-[26px] text-ink">
            {product.name}
          </Text>
          <Text className="font-inter-bold text-[28px] text-ink">
            {formatMoney(product.price)}
            <Text className="font-inter text-[13px] text-muted"> / {product.unit}</Text>
          </Text>
          <View className="flex-row gap-sm">
            <View
              className={`h-[22px] justify-center rounded-full px-[10px] ${inStock ? 'bg-[#E6F6EC]' : 'bg-chip'}`}
            >
              <Text
                className={`font-inter-medium text-[11px] ${inStock ? 'text-success-ink' : 'text-muted'}`}
              >
                {inStock ? 'In stock' : 'Out of stock'}
              </Text>
            </View>
            {inStock ? (
              <View className="h-[22px] justify-center rounded-full bg-sponsor-bg px-[10px]">
                <Text className="font-inter-medium text-[11px] text-sponsor-ink">
                  {product.stock.toLocaleString('en-US')} available
                </Text>
              </View>
            ) : null}
          </View>
        </DetailCard>
        {product.specs.length ? (
          <DetailCard title="Specifications">
            <SpecTable specs={product.specs} />
          </DetailCard>
        ) : null}
        {product.description ? (
          <DetailCard title="About this product">
            <Text className="font-inter text-[13.5px] leading-[20px] text-ink-soft">
              {product.description}
            </Text>
          </DetailCard>
        ) : null}
        <DetailCard title="Shipping">
          <Text className="font-inter text-[13px] leading-[19px] text-ink-soft">
            {product.shippingLabel}. Freight options are confirmed at checkout.
          </Text>
        </DetailCard>
      </ScrollView>
      <BottomBar>
        <QuantityStepper value={quantity} min={product.moq} max={max} onChange={setQuantity} />
        <Pressable
          onPress={() => requireAuth('Cart')}
          accessibilityRole="button"
          className="h-[44px] flex-1 items-center justify-center rounded-full bg-primary active:bg-primary-pressed"
        >
          <Text className="font-poppins-semibold text-[14px] text-white">
            Add to cart · {formatMoney(product.price * quantity)}
          </Text>
        </Pressable>
      </BottomBar>
    </>
  );
}

export function ProductDetailScreen({ uuid }: { uuid: string }) {
  const goBack = useGoBack();
  const { product, isLoading, error, retry } = useProductDetail(uuid);

  return (
    <View className="flex-1 bg-white">
      <ListingHeader title="Product" onBack={goBack} />
      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? (
        <EmptyState
          icon="bell"
          title="Could not load this product"
          message={error}
          actionLabel="Try again"
          onAction={retry}
        />
      ) : null}
      {!isLoading && !error && !product ? (
        <EmptyState
          title="Product not found"
          message="It may have sold out or been removed."
          actionLabel="Back to products"
          onAction={goBack}
        />
      ) : null}
      {product ? <ProductBody key={product.id} product={product} /> : null}
    </View>
  );
}
