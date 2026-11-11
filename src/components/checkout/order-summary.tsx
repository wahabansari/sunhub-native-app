import { Pressable, Text, View } from 'react-native';

import { Bone, SkeletonPulse } from '@/components/motion/bone';
import type { OrderTotals } from '@/types/cart';
import { formatMoney } from '@/utils/home-format';

type Props = {
  subtotal: number;
  totals: OrderTotals | undefined;
  /** True while the server is recalculating; the old figures stay visible but dimmed. */
  isCalculating: boolean;
  /** Tax is only known once a shipping address is chosen. */
  hasAddress: boolean;
  error: string | null;
  onRetry: () => void;
};

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row items-baseline justify-between">
      <Text
        className={`font-inter ${bold ? 'font-inter-bold text-[16px] text-ink' : 'text-[14px] text-ink-soft'}`}
      >
        {label}
      </Text>
      <Text
        className={`${bold ? 'font-inter-bold text-[20px] text-ink' : 'font-inter-medium text-[14px] text-ink'}`}
      >
        {value}
      </Text>
    </View>
  );
}

/** Every figure except the subtotal comes from the server's own calculation. */
export function OrderSummary({
  subtotal,
  totals,
  isCalculating,
  hasAddress,
  error,
  onRetry,
}: Props) {
  if (error && !totals) {
    return (
      <View className="gap-[8px] rounded-[16px] bg-surface p-md">
        <Text className="font-inter text-[13.5px] text-danger">{error}</Text>
        <Pressable onPress={onRetry} hitSlop={8} accessibilityRole="button" className="self-start">
          <Text className="font-poppins-semibold text-[13.5px] text-primary">Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (!totals) {
    return (
      <SkeletonPulse>
        <View className="gap-[12px] rounded-[16px] bg-surface p-md">
          <Bone className="h-[14px] w-full rounded-full bg-border" />
          <Bone className="h-[14px] w-full rounded-full bg-border" />
          <Bone className="h-[20px] w-full rounded-full bg-border" />
        </View>
      </SkeletonPulse>
    );
  }

  return (
    <View
      accessibilityLiveRegion="polite"
      className={`gap-[10px] rounded-[16px] bg-surface p-md ${isCalculating ? 'opacity-60' : ''}`}
    >
      <Row label="Subtotal" value={formatMoney(subtotal)} />
      <Row label="Shipping" value={formatMoney(totals.shipping)} />
      <Row
        label={hasAddress ? 'Tax' : 'Tax (added once you enter an address)'}
        value={hasAddress ? formatMoney(totals.tax) : '—'}
      />
      <Row label="Processing fee" value={formatMoney(totals.processingFee)} />
      <View className="my-[2px] h-px bg-border" />
      <Row label="Total" value={formatMoney(totals.total)} bold />
    </View>
  );
}
