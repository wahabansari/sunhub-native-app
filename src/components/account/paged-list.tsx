import type { ReactElement } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/listing/empty-state';
import { Bone, SkeletonPulse } from '@/components/motion/bone';
import { colors } from '@/theme/tokens';

function RowsSkeleton() {
  return (
    <SkeletonPulse>
      <View className="gap-[14px] px-md pt-md">
        {[0, 1, 2, 3].map((row) => (
          <View key={row} className="gap-[8px] rounded-[16px] border border-[#EEF0F3] p-md">
            <Bone className="h-[14px] w-[50%] rounded-full" />
            <Bone className="h-[12px] w-[80%] rounded-full" />
            <Bone className="h-[12px] w-[35%] rounded-full" />
          </View>
        ))}
      </View>
    </SkeletonPulse>
  );
}

type Props<T> = {
  data: T[];
  keyOf: (item: T) => string;
  renderItem: (item: T) => ReactElement;
  /** e.g. "12 orders"; shown above the list once loaded. */
  summary?: string;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  emptyTitle: string;
  emptyMessage: string;
  onLoadMore: () => void;
  onRefresh: () => void;
};

/** A list screen body with the skeleton, error, empty and paging states every account list shares. */
export function PagedList<T>({
  data,
  keyOf,
  renderItem,
  summary,
  isLoading,
  isRefreshing,
  isLoadingMore,
  error,
  emptyTitle,
  emptyMessage,
  onLoadMore,
  onRefresh,
}: Props<T>) {
  const insets = useSafeAreaInsets();

  if (isLoading) return <RowsSkeleton />;

  if (error && !data.length) {
    return (
      <EmptyState
        icon="bell"
        title="Could not load this list"
        message={error}
        actionLabel="Try again"
        onAction={onRefresh}
      />
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={keyOf}
      renderItem={({ item }) => renderItem(item)}
      showsVerticalScrollIndicator={false}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.6}
      initialNumToRender={6}
      windowSize={7}
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}
      ListHeaderComponent={
        summary ? (
          <Text className="font-inter-medium text-[12px] text-muted">{summary}</Text>
        ) : undefined
      }
      ListEmptyComponent={<EmptyState title={emptyTitle} message={emptyMessage} />}
      ListFooterComponent={
        isLoadingMore ? (
          <View className="py-md">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : undefined
      }
    />
  );
}
