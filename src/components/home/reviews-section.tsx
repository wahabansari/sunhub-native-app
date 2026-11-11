import { ScrollView, Text, View } from 'react-native';

import { HOME_REVIEWS } from '@/constants/home-content';
import { initialsOf } from '@/utils/home-format';

import { SectionHeader } from './section-header';

type Props = { onViewAll?: () => void };

export function ReviewsSection({ onViewAll }: Props) {
  return (
    <View className="mt-lg bg-alt pb-[20px] pt-lg">
      <SectionHeader title="Real results" actionLabel="View all" onAction={onViewAll} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-sm px-md pb-[4px]"
      >
        {HOME_REVIEWS.map((review) => (
          <View key={review.id} className="w-[268px] gap-sm rounded-[20px] bg-white p-md">
            <Text className="h-[18px] font-inter-bold text-[36px] leading-[22px] text-accent">
              “
            </Text>
            <Text
              className="flex-1 font-inter-medium text-[14px] leading-[21px] text-ink"
              numberOfLines={4}
            >
              {review.text}
            </Text>
            <View className="mt-[4px] flex-row items-center gap-[10px]">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-light">
                <Text className="font-inter-bold text-[12px] text-primary">
                  {initialsOf(review.name)}
                </Text>
              </View>
              <View>
                <Text className="font-inter-semibold text-[13px] text-ink">{review.name}</Text>
                <Text className="font-inter text-[11.5px] text-muted">{review.date}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
