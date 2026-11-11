import { Pressable, Text, View } from 'react-native';

import { Bone, SkeletonPulse } from '@/components/motion/bone';
import type { SectionState } from '@/hooks/use-home-sections';

export type SkeletonKind = 'cards' | 'list' | 'block';

function Skeleton({ kind, height }: { kind: SkeletonKind; height: number }) {
  if (kind === 'cards') {
    return (
      <View className="flex-row gap-sm px-md">
        {[0, 1, 2].map((index) => (
          <View key={index} className="w-[146px] gap-[6px]">
            <Bone className="h-[131px] rounded-[14px]" />
            <Bone className="h-[12px] w-[120px] rounded-full" />
            <Bone className="h-[12px] w-[80px] rounded-full" />
          </View>
        ))}
      </View>
    );
  }
  if (kind === 'list') {
    return (
      <View className="gap-[10px] px-md">
        {[0, 1, 2].map((index) => (
          <View key={index} className="flex-row items-center gap-[12px]">
            <Bone className="h-9 w-[54px] rounded-md" />
            <View className="flex-1 gap-[6px]">
              <Bone className="h-[12px] w-[60%] rounded-full" />
              <Bone className="h-[10px] w-[40%] rounded-full" />
            </View>
            <Bone className="h-[14px] w-[56px] rounded-full" />
          </View>
        ))}
      </View>
    );
  }
  return (
    <View className="px-md">
      <View style={{ height }}>
        <Bone className="h-full rounded-[20px]" />
      </View>
    </View>
  );
}

type Props = {
  state: Pick<SectionState<unknown>, 'isLoading' | 'error' | 'retry'>;
  /** Shown when the request succeeded but returned nothing. */
  emptyText: string;
  kind?: SkeletonKind;
  height?: number;
};

/** Stands in for a section's content while it loads, after it fails, or when it is empty. */
export function SectionPlaceholder({ state, emptyText, kind = 'cards', height = 160 }: Props) {
  if (state.isLoading) {
    return (
      <SkeletonPulse>
        <Skeleton kind={kind} height={height} />
      </SkeletonPulse>
    );
  }

  if (state.error) {
    return (
      <View className="mx-md flex-row items-center gap-[12px] rounded-[14px] bg-chip px-md py-[12px]">
        <Text className="flex-1 font-inter text-[13px] leading-[18px] text-ink-soft">
          {state.error}
        </Text>
        <Pressable
          onPress={state.retry}
          accessibilityRole="button"
          accessibilityLabel="Retry loading this section"
          className="h-[34px] items-center justify-center rounded-full bg-primary px-md active:bg-primary-pressed"
        >
          <Text className="font-poppins-semibold text-[12.5px] text-white">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return <Text className="px-md font-inter text-[13px] text-muted">{emptyText}</Text>;
}
