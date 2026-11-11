import type { ReactElement } from 'react';
import { ActivityIndicator, FlatList, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bone, SkeletonPulse } from '@/components/motion/bone';
import { colors } from '@/theme/tokens';

import { EmptyState } from './empty-state';

const GUTTER = 16;
const GAP = 8;

function GridSkeleton({ cellWidth }: { cellWidth: number }) {
  return (
    <SkeletonPulse>
      <View className="gap-[18px] pt-[10px]">
        <View className="px-[14px] pb-[2px]">
          <Bone className="h-[12px] w-[120px] rounded-full" />
        </View>
        {[0, 1, 2].map((row) => (
          <View key={row} className="flex-row gap-[8px] px-[16px]">
            {[0, 1].map((cell) => (
              <View key={cell} style={{ width: cellWidth }} className="gap-[7px]">
                <Bone className="aspect-[1/0.92] w-full rounded-[14px]" />
                <Bone className="h-[13px] w-full rounded-full" />
                <Bone className="h-[13px] w-[70%] rounded-full" />
                <Bone className="h-[18px] w-[45%] rounded-full" />
              </View>
            ))}
          </View>
        ))}
      </View>
    </SkeletonPulse>
  );
}

type Props<T> = {
  data: T[];
  keyOf: (item: T) => string;
  renderCard: (item: T) => ReactElement;
  countLabel: string;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  emptyTitle: string;
  emptyMessage: string;
  onClearFilters?: () => void;
  onLoadMore: () => void;
  onRefresh: () => void;
};

/** Two-column result list with the loading, error, empty and paging states every listing shares. */
export function ResultGrid<T>({
  data,
  keyOf,
  renderCard,
  countLabel,
  isLoading,
  isRefreshing,
  isLoadingMore,
  error,
  emptyTitle,
  emptyMessage,
  onClearFilters,
  onLoadMore,
  onRefresh,
}: Props<T>) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const cellWidth = (width - GUTTER * 2 - GAP) / 2;

  if (isLoading) return <GridSkeleton cellWidth={cellWidth} />;

  if (error && !data.length) {
    return (
      <EmptyState
        icon="bell"
        title="Could not load results"
        message={error}
        actionLabel="Try again"
        onAction={onRefresh}
      />
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(220)} className="flex-1">
      <FlatList
        data={data}
        numColumns={2}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews
        keyExtractor={keyOf}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.6}
        columnWrapperStyle={{ gap: GAP, paddingHorizontal: GUTTER }}
        contentContainerStyle={{ rowGap: 18, paddingBottom: insets.bottom + 24 }}
        ListHeaderComponent={
          <Text className="px-[14px] pb-[8px] pt-[10px] font-inter-medium text-[12px] text-muted">
            {countLabel}
          </Text>
        }
        ListEmptyComponent={
          <EmptyState
            title={emptyTitle}
            message={emptyMessage}
            actionLabel={onClearFilters ? 'Clear filters' : undefined}
            onAction={onClearFilters}
          />
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View className="py-md">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : undefined
        }
        renderItem={({ item }) => <View style={{ width: cellWidth }}>{renderCard(item)}</View>}
      />
    </Animated.View>
  );
}
