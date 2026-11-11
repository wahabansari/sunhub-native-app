import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CATEGORY_ART } from '@/components/home/category-art';
import { Icon } from '@/components/icons/icon';
import { EmptyState, LoadingState } from '@/components/listing/empty-state';
import { HOME_CATEGORIES } from '@/constants/home-content';
import { useDealList } from '@/hooks/use-deal-list';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useGoBack } from '@/hooks/use-go-back';
import { useProductList } from '@/hooks/use-product-list';
import { colors } from '@/theme/tokens';
import type { HomeDeal, HomeProduct } from '@/types/home';
import { dealPrice, formatMoney } from '@/utils/home-format';

const POPULAR = ['Solar panel', 'Inverter', 'Battery', 'Racking', 'EV charger'];
const MIN_QUERY = 2;
const PREVIEW_COUNT = 8;
const TABS = ['all', 'deals', 'products'] as const;
type Tab = (typeof TABS)[number];

function Thumb({ uri, label }: { uri?: string; label: string }) {
  return (
    <View
      className="h-12 w-12 items-center justify-center overflow-hidden rounded-[10px] bg-chip"
      style={{ isolation: 'isolate' }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: 42, height: 42, mixBlendMode: 'multiply' }}
          resizeMode="contain"
          accessibilityLabel={label}
        />
      ) : (
        <Icon name="sun" size={20} color={colors.border} />
      )}
    </View>
  );
}

type RowProps = { imageUrl?: string; title: string; subtitle: string; onPress: () => void };

function ResultRow({ imageUrl, title, subtitle, onPress }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="min-h-[64px] flex-row items-center gap-[12px] border-b border-[#EEF0F3] bg-white px-md py-sm active:bg-chip"
    >
      <Thumb uri={imageUrl} label={title} />
      <View className="flex-1 gap-px">
        <Text className="font-inter-medium text-[14px] leading-[18px] text-ink" numberOfLines={2}>
          {title}
        </Text>
        <Text className="font-inter text-[12px] text-muted" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Icon name="chevron" size={18} color={colors.faint} />
    </Pressable>
  );
}

function dealSubtitle(deal: HomeDeal): string {
  const price = dealPrice(deal);
  return `${price.amount}${price.short} · ${deal.location ?? 'Nationwide'}`;
}

function productSubtitle(product: HomeProduct): string {
  return `${formatMoney(product.price)} / ${product.unit}`;
}

export function SearchScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const query = useDebouncedValue(text.trim(), 350);
  const active = query.length >= MIN_QUERY;
  const deals = useDealList({ search: query }, active);
  const products = useProductList({ search: query }, active);
  const searching = active && (deals.isLoading || products.isLoading);
  const showDeals = tab !== 'products' && deals.items.length > 0;
  const showProducts = tab !== 'deals' && products.items.length > 0;
  const counts: Record<Tab, number> = {
    all: deals.total + products.total,
    deals: deals.total,
    products: products.total,
  };

  return (
    <View className="flex-1 bg-white">
      <View className="border-b border-[#EEF0F3] bg-white" style={{ paddingTop: insets.top }}>
        <View className="h-[56px] flex-row items-center gap-[4px] pl-[4px] pr-md">
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            className="h-10 w-10 items-center justify-center rounded-full active:bg-chip"
          >
            <Icon name="back" size={22} color={colors.ink} />
          </Pressable>
          <View className="h-[42px] flex-1 flex-row items-center gap-sm rounded-full bg-chip px-[14px]">
            <Icon name="search" size={18} color={colors.muted} />
            <TextInput
              value={text}
              onChangeText={setText}
              autoFocus
              autoCorrect={false}
              returnKeyType="search"
              placeholder="Search panels, inverters…"
              placeholderTextColor={colors.faint}
              accessibilityLabel="Search"
              className="flex-1 font-inter text-[14px] text-ink"
            />
            {text ? (
              <Pressable
                onPress={() => setText('')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Icon name="close" size={16} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {!active ? (
          <>
            <Text className="px-md pb-sm pt-[18px] font-poppins-semibold text-[15px] text-ink">
              Popular searches
            </Text>
            <View className="flex-row flex-wrap gap-sm px-md pb-md">
              {POPULAR.map((term) => (
                <Pressable
                  key={term}
                  onPress={() => setText(term)}
                  accessibilityRole="button"
                  className="h-[34px] flex-row items-center gap-[6px] rounded-full bg-chip px-[14px] active:opacity-80"
                >
                  <Icon name="search" size={14} color={colors.muted} />
                  <Text className="font-inter-medium text-[13px] text-ink">{term}</Text>
                </Pressable>
              ))}
            </View>
            <Text className="px-md pb-sm pt-[10px] font-poppins-semibold text-[15px] text-ink">
              Browse categories
            </Text>
            <View className="flex-row flex-wrap justify-between gap-y-[14px] px-md pb-lg">
              {HOME_CATEGORIES.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() =>
                    router.push({
                      pathname: '/products',
                      params: { category: String(category.parentId) },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={category.name}
                  className="w-[31%] gap-[6px] active:opacity-80"
                >
                  <View className="aspect-[1/0.9] items-center justify-center rounded-[20px] bg-chip">
                    <Image
                      source={CATEGORY_ART[category.art]}
                      style={{ width: '58%', height: '58%', mixBlendMode: 'multiply' }}
                      resizeMode="contain"
                    />
                  </View>
                  <Text className="font-poppins-semibold text-[12.5px] text-ink" numberOfLines={1}>
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <>
            <View className="flex-row gap-sm px-md py-[12px]">
              {TABS.map((id) => {
                const on = tab === id;
                return (
                  <Pressable
                    key={id}
                    onPress={() => setTab(id)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: on }}
                    className={`h-9 flex-row items-center gap-[6px] rounded-full border px-[14px] ${
                      on ? 'border-primary bg-primary-light' : 'border-transparent bg-chip'
                    }`}
                  >
                    <Text
                      className={`font-inter-medium text-[13px] capitalize ${on ? 'text-primary' : 'text-ink'}`}
                    >
                      {id}
                    </Text>
                    <Text className={`font-inter-bold text-[11px] text-primary`}>
                      {counts[id].toLocaleString('en-US')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {searching ? <LoadingState label="Searching…" /> : null}
            {showDeals ? (
              <>
                <Text className="px-md pb-[6px] pt-sm font-poppins-semibold text-[15px] text-ink">
                  Deals
                </Text>
                {deals.items.slice(0, PREVIEW_COUNT).map((deal) => (
                  <ResultRow
                    key={deal.id}
                    imageUrl={deal.imageUrl}
                    title={deal.name}
                    subtitle={dealSubtitle(deal)}
                    onPress={() => router.push(`/deals/${deal.id}`)}
                  />
                ))}
                {deals.total > PREVIEW_COUNT ? (
                  <Pressable
                    onPress={() => router.push({ pathname: '/deals', params: { q: query } })}
                    accessibilityRole="button"
                    className="px-md py-sm"
                  >
                    <Text className="font-poppins-medium text-[13px] text-primary">
                      See all {deals.total.toLocaleString('en-US')} deals
                    </Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}
            {showProducts ? (
              <>
                <Text className="px-md pb-[6px] pt-sm font-poppins-semibold text-[15px] text-ink">
                  Products
                </Text>
                {products.items.slice(0, PREVIEW_COUNT).map((product) => (
                  <ResultRow
                    key={product.id}
                    imageUrl={product.imageUrl}
                    title={product.name}
                    subtitle={productSubtitle(product)}
                    onPress={() => router.push(`/products/${product.id}`)}
                  />
                ))}
                {products.total > PREVIEW_COUNT ? (
                  <Pressable
                    onPress={() => router.push({ pathname: '/products', params: { q: query } })}
                    accessibilityRole="button"
                    className="px-md py-sm"
                  >
                    <Text className="font-poppins-medium text-[13px] text-primary">
                      See all {products.total.toLocaleString('en-US')} products
                    </Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}
            {!searching && !showDeals && !showProducts ? (
              <EmptyState title="No results" message="Try “panel”, “inverter” or “battery”." />
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
