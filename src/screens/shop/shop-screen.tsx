import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import { showComingSoon } from '@/components/feedback/notices';
import { CATEGORY_ART } from '@/components/home/category-art';
import { Icon } from '@/components/icons/icon';
import { ListingHeader } from '@/components/listing/listing-header';
import { HOME_CATEGORIES } from '@/constants/home-content';
import { useGoBack } from '@/hooks/use-go-back';
import { useCategoryCounts } from '@/hooks/use-listing-options';
import { colors } from '@/theme/tokens';

export function ShopScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const counts = useCategoryCounts();

  return (
    <View className="flex-1 bg-white">
      <ListingHeader
        title="Shop"
        onBack={goBack}
        actions={[
          { icon: 'search', label: 'Search', onPress: () => router.push('/search') },
          { icon: 'cart', label: 'Cart', onPress: () => showComingSoon('Cart') },
        ]}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-[4px]">
          {HOME_CATEGORIES.map((category) => {
            const count = counts[category.parentId];
            return (
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
                className="min-h-[76px] flex-row items-center gap-[12px] border-b border-[#EEF0F3] px-md py-sm active:bg-chip"
              >
                <View className="h-[60px] w-[60px] items-center justify-center rounded-[14px] bg-chip">
                  <Image
                    source={CATEGORY_ART[category.art]}
                    style={{ width: 44, height: 44, mixBlendMode: 'multiply' }}
                    resizeMode="contain"
                  />
                </View>
                <View className="flex-1 gap-px">
                  <Text className="font-poppins-semibold text-[15px] text-ink">
                    {category.name}
                  </Text>
                  <Text className="font-inter text-[12px] text-muted">
                    {count === undefined ? 'Loading…' : `${count.toLocaleString('en-US')} products`}
                  </Text>
                </View>
                <Icon name="chevron" size={18} color={colors.faint} />
              </Pressable>
            );
          })}
        </View>
        <View className="p-md">
          <Pressable
            onPress={() => router.push('/products')}
            accessibilityRole="button"
            className="h-[46px] items-center justify-center rounded-full border border-[#D1D5DB] active:bg-chip"
          >
            <Text className="font-poppins-semibold text-[14px] text-ink">View all products</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
