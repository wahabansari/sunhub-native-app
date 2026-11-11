import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { QuantityStepper } from '@/components/cart/quantity-stepper';
import { BottomBar, DetailCard, ImageGallery, SpecTable } from '@/components/listing/detail-parts';
import { EmptyState, LoadingState } from '@/components/listing/empty-state';
import { ListingHeader } from '@/components/listing/listing-header';
import { useGoBack } from '@/hooks/use-go-back';
import { useAddToCart } from '@/hooks/use-cart';
import { useCartAction } from '@/hooks/use-cart-action';
import { useProductDetail } from '@/hooks/use-product-detail';
import type { ProductDetail } from '@/types/listing';
import { formatMoney } from '@/utils/home-format';

function ProductBody({ product }: { product: ProductDetail }) {
  const { add, isAdding } = useAddToCart();
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
          onPress={() => add(product.id, quantity, { moq: product.moq, stock: product.stock })}
          disabled={isAdding || !inStock}
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
  const cartAction = useCartAction();
  const { product, isPlaceholder, isLoading, error, retry } = useProductDetail(uuid);

  return (
    <View className="flex-1 bg-white">
      <ListingHeader title="Product" onBack={goBack} actions={[cartAction]} />
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
      {product ? <ProductBody key={`${product.id}:${isPlaceholder}`} product={product} /> : null}
    </View>
  );
}
