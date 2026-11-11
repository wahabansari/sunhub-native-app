import { useState, type ReactNode } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductImage } from '@/components/catalog/product-image';
import { Icon } from '@/components/icons/icon';
import { colors } from '@/theme/tokens';
import type { DetailDocument, DetailSpec } from '@/types/listing';

const HERO_HEIGHT = 260;

type GalleryProps = {
  urls: string[];
  label: string;
  /** Pills drawn over the picture (negotiable, compliance, sponsored). */
  pills?: { label: string; tone: 'orange' | 'blue' | 'amber' }[];
};

const PILL_TONES = {
  orange: { box: 'bg-[#FFF1E6]', text: 'text-[#C2410C]' },
  blue: { box: 'bg-[#E8F0FF]', text: 'text-[#1D4ED8]' },
  amber: { box: 'bg-sponsor-bg', text: 'text-sponsor-ink' },
} as const;

export function ImageGallery({ urls, label, pills = [] }: GalleryProps) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const pictures = urls.length ? urls : [undefined];

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <View className="bg-white" style={{ height: HERO_HEIGHT }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
      >
        {pictures.map((uri, index) => (
          <View
            key={uri ?? 'placeholder'}
            style={{ width, height: HERO_HEIGHT, isolation: 'isolate' }}
          >
            <ProductImage
              uri={uri}
              label={`${label}, picture ${index + 1}`}
              inset={{ top: 44, x: 24, bottom: 24 }}
              fallbackSize={64}
            />
          </View>
        ))}
      </ScrollView>
      <View className="absolute left-[12px] top-[12px] flex-row flex-wrap gap-[4px]">
        {pills.map((pill) => (
          <View
            key={pill.label}
            className={`h-[22px] items-center justify-center rounded-full px-[10px] ${PILL_TONES[pill.tone].box}`}
          >
            <Text className={`font-inter-medium text-[11px] ${PILL_TONES[pill.tone].text}`}>
              {pill.label}
            </Text>
          </View>
        ))}
      </View>
      {pictures.length > 1 ? (
        <View className="absolute bottom-[10px] w-full flex-row justify-center gap-[6px]">
          {pictures.map((uri, index) => (
            <View
              key={`dot-${uri ?? index}`}
              className={`h-[6px] rounded-full ${index === page ? 'w-[18px] bg-primary' : 'w-[6px] bg-border'}`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function DetailCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View className="gap-[10px] border-b-[8px] border-surface p-[14px]">
      {title ? (
        <View className="flex-row items-center gap-sm">
          <View className="h-4 w-1 rounded-full bg-primary" />
          <Text className="font-poppins-semibold text-[14.5px] text-ink">{title}</Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function SpecTable({ specs }: { specs: DetailSpec[] }) {
  return (
    <View className="overflow-hidden rounded-[12px] border border-border">
      {specs.map((spec, index) => (
        <View
          key={spec.label}
          className={`flex-row justify-between gap-[12px] px-[14px] py-[11px] ${
            index % 2 === 0 ? 'bg-chip' : 'bg-white'
          }`}
        >
          <Text className="font-inter text-[13px] text-muted">{spec.label}</Text>
          <Text className="flex-1 text-right font-inter-semibold text-[13px] text-ink">
            {spec.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function DocumentRow({ document }: { document: DetailDocument }) {
  const open = () => {
    if (/^https:\/\//i.test(document.url)) void Linking.openURL(document.url);
  };

  return (
    <Pressable
      onPress={open}
      accessibilityRole="link"
      accessibilityLabel={`Open ${document.name}`}
      className="min-h-[52px] flex-row items-center gap-[12px] rounded-[12px] border border-border bg-white px-[12px] py-sm active:bg-chip"
    >
      <View className="h-9 w-9 items-center justify-center rounded-[10px] bg-[#FEE2E2]">
        <Icon name="doc" size={18} color="#B91C1C" />
      </View>
      <Text className="flex-1 font-inter-medium text-[13px] text-ink" numberOfLines={2}>
        {document.name}
      </Text>
      <Icon name="chevron" size={16} color={colors.faint} />
    </Pressable>
  );
}

export function BottomBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center gap-sm border-t border-[#EEF0F3] bg-white px-[14px] pt-[10px]"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      {children}
    </View>
  );
}
