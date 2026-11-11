import { Image, ScrollView, Text, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { PressableScale } from '@/components/motion/pressable-scale';
import { colors } from '@/theme/tokens';
import type { SectionState } from '@/hooks/use-home-sections';
import type { HomeArticle } from '@/types/home';

import { SectionHeader } from './section-header';
import { SectionPlaceholder } from './section-placeholder';

type Props = {
  state: SectionState<HomeArticle[]>;
  onSelect?: (article: HomeArticle) => void;
  onGoToBlog?: () => void;
};

export function ArticlesSection({ state, onSelect, onGoToBlog }: Props) {
  const articles = state.data ?? [];

  return (
    <View className="pt-lg">
      <SectionHeader title="Latest articles" actionLabel="Go to blog" onAction={onGoToBlog} />
      {articles.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-[10px] px-md"
        >
          {articles.map((article) => (
            <PressableScale
              key={article.id}
              onPress={() => onSelect?.(article)}
              accessibilityRole="button"
              accessibilityLabel={article.title}
              className="w-[240px]"
              contentClassName="gap-[10px]"
            >
              <View className="h-[150px] items-center justify-center overflow-hidden rounded-[16px] bg-chip">
                {article.imageUrl ? (
                  <Image
                    source={{ uri: article.imageUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                    accessibilityLabel={article.title}
                  />
                ) : (
                  <Icon name="sun" size={40} color={colors.border} />
                )}
              </View>
              <Text
                className="font-poppins-semibold text-[14px] leading-[19px] text-ink"
                numberOfLines={3}
              >
                {article.title}
              </Text>
            </PressableScale>
          ))}
        </ScrollView>
      ) : (
        <SectionPlaceholder state={state} emptyText="Articles are unavailable right now." />
      )}
    </View>
  );
}
