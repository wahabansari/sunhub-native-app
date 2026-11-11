import { useLocalSearchParams } from 'expo-router';

import { ProductDetailScreen } from '@/screens/products/product-detail-screen';

export default function ProductDetailRoute() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  return <ProductDetailScreen uuid={uuid} />;
}
