import { useLocalSearchParams } from 'expo-router';

import { DealDetailScreen } from '@/screens/deals/deal-detail-screen';

export default function DealDetailRoute() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  return <DealDetailScreen listingId={listingId} />;
}
