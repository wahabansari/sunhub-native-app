import { ScrollView, Text, View } from 'react-native';

import { PressableScale } from '@/components/motion/pressable-scale';
import type { PickupRow } from '@/utils/pickup';

type Props = {
  rows: PickupRow[];
  selected: string | null;
  onSelect: (code: string) => void;
};

/** Horizontal state selector, styled like the category pills. */
export function StatePills({ rows, selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-sm px-md pb-[4px]"
    >
      {rows.map((row) => {
        const on = row.code === selected;
        return (
          <PressableScale
            key={row.code}
            onPress={() => onSelect(row.code)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${row.name}, ${row.total} deals`}
            className={`h-[46px] rounded-full ${on ? 'bg-primary' : 'bg-chip'}`}
            contentClassName="h-full flex-row items-center gap-sm pl-[5px] pr-md"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
              <Text className="font-inter-bold text-[12px] text-primary">{row.code}</Text>
            </View>
            <Text className={`font-poppins-semibold text-[13px] ${on ? 'text-white' : 'text-ink'}`}>
              {row.name}
            </Text>
            <Text
              className={`font-inter-medium text-[12px] ${on ? 'text-white/85' : 'text-muted'}`}
            >
              {row.total}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}
