import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { usePickupDeals, type SectionState } from '@/hooks/use-home-sections';
import type { HomeDeal, PickupState } from '@/types/home';
import { US_STATE_NAMES } from '@/constants/us-states';
import { buildPickupRows } from '@/utils/pickup';

import { SectionHeader } from './section-header';
import { SectionPlaceholder } from './section-placeholder';
import { StateDeals } from './state-deals';
import { StatePills } from './state-pills';

type Props = {
  state: SectionState<PickupState[]>;
  onSeeAll?: () => void;
  /** Opens the full list of deals for a state. */
  onOpenState?: (code: string) => void;
  onOpenDeal?: (deal: HomeDeal) => void;
};

export function PickupSection({ state, onSeeAll, onOpenState, onOpenDeal }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const totals = useMemo(
    () => Object.fromEntries((state.data ?? []).map((entry) => [entry.code, entry.total])),
    [state.data],
  );
  const rows = useMemo(() => buildPickupRows(totals, US_STATE_NAMES), [totals]);
  // The busiest state is selected until the user picks another one.
  const selected = picked && picked in totals ? picked : (rows[0]?.code ?? null);
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
              stateName={US_STATE_NAMES[selected] ?? selected}
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
    </View>
  );
}
