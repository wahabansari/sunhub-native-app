import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { usePickupDeals, type SectionState } from '@/hooks/use-home-sections';
import { colors } from '@/theme/tokens';
import type { HomeDeal, PickupState } from '@/types/home';
import { buildPickupRows, selectionTiers } from '@/utils/pickup';

import { SectionHeader } from './section-header';
import { SectionPlaceholder } from './section-placeholder';
import { StateDeals } from './state-deals';
import { StatePills } from './state-pills';
import { UsMap } from './us-map';
import { US_STATES } from './us-map-data';

const STATE_NAMES = Object.fromEntries(US_STATES.map((state) => [state.code, state.name]));
const LEGEND = [
  { label: 'Selected', color: colors.primary },
  { label: 'Has deals', color: colors.accent },
  { label: 'No deals yet', color: colors.border },
] as const;

type Props = {
  state: SectionState<PickupState[]>;
  onSeeAll?: () => void;
  /** Opens the full list of deals for a state. */
  onOpenState?: (code: string) => void;
  onOpenDeal?: (deal: HomeDeal) => void;
};

export function PickupMapSection({ state, onSeeAll, onOpenState, onOpenDeal }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const totals = useMemo(
    () => Object.fromEntries((state.data ?? []).map((entry) => [entry.code, entry.total])),
    [state.data],
  );
  const rows = useMemo(() => buildPickupRows(totals, STATE_NAMES), [totals]);
  // The busiest state is selected until the user picks another one.
  const selected = picked && picked in totals ? picked : (rows[0]?.code ?? null);
  const tiers = useMemo(() => selectionTiers(totals, selected), [totals, selected]);
  const deals = usePickupDeals(selected);

  return (
    <View className="pt-lg">
      <SectionHeader title="Local pickup deals" actionLabel="See all" onAction={onSeeAll} />
      <Text className="px-md pb-[12px] font-inter text-[13px] leading-[19px] text-[#5B6675]">
        Pick a state to see the deals you can collect locally.
      </Text>
      {rows.length ? (
        <>
          <StatePills rows={rows} selected={selected} onSelect={setPicked} />
          {selected ? (
            <StateDeals
              stateName={STATE_NAMES[selected] ?? selected}
              state={deals}
              onOpenDeal={onOpenDeal}
              onViewAll={() => onOpenState?.(selected)}
            />
          ) : null}
        </>
      ) : (
        <SectionPlaceholder
          state={state}
          emptyText="No states have active deals right now."
          kind="list"
        />
      )}
      <View className="mt-[16px]">
        <UsMap tiers={tiers} onSelect={(code) => code in tiers && setPicked(code)} />
        <View className="flex-row flex-wrap items-center gap-[14px] px-md pt-[12px]">
          {LEGEND.map((item) => (
            <View key={item.label} className="flex-row items-center gap-[6px]">
              <View
                className="h-[10px] w-[10px] rounded-[3px]"
                style={{ backgroundColor: item.color }}
              />
              <Text className="font-inter text-[11.5px] text-muted">{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
