import { useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/icons/icon';
import { colors } from '@/theme/tokens';

type Tone = 'good' | 'bad' | 'neutral';

const TONES: Record<Tone, { box: string; text: string }> = {
  good: { box: 'bg-[#DCFCE7]', text: 'text-success-ink' },
  bad: { box: 'bg-[#FEE2E2]', text: 'text-danger' },
  neutral: { box: 'bg-chip', text: 'text-ink-soft' },
};

function toneFor(status: string): Tone {
  const value = status.toLowerCase();
  if (/(deliver|ship|complete|paid|active|success)/.test(value)) return 'good';
  if (/(cancel|refund|fail|declin|inactive|reject)/.test(value)) return 'bad';
  return 'neutral';
}

/** A small coloured label for an order or listing status. */
export function StatusChip({ status, label }: { status: string; label?: string }) {
  const text = label ?? status;
  if (!text) return null;
  const tone = TONES[toneFor(status || text)];

  return (
    <View className={`self-start rounded-full px-[10px] py-[3px] ${tone.box}`}>
      <Text className={`font-inter-semibold text-[11px] capitalize ${tone.text}`}>
        {text.replace(/[_-]+/g, ' ')}
      </Text>
    </View>
  );
}

/** The bordered card every account list row sits in. */
export function InfoCard({ children }: { children: ReactNode }) {
  return (
    <View className="gap-[8px] rounded-[16px] border border-[#EEF0F3] bg-white p-md">
      {children}
    </View>
  );
}

type MenuRowProps = {
  icon: IconName;
  label: string;
  hint?: string;
  onPress: () => void;
};

/** A tappable row of the account menu. */
export function MenuRow({ icon, label, hint, onPress }: MenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center gap-[12px] border-b border-[#EEF0F3] py-[14px] active:bg-chip"
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-light">
        <Icon name={icon} size={18} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="font-poppins-medium text-[14.5px] text-ink">{label}</Text>
        {hint ? <Text className="font-inter text-[12px] text-muted">{hint}</Text> : null}
      </View>
      <Icon name="chevron" size={18} color={colors.faint} />
    </Pressable>
  );
}

type RemoveProps = { onConfirm: () => void; isBusy?: boolean };

/** "Remove" that asks once before it acts. */
export function ConfirmRemove({ onConfirm, isBusy = false }: RemoveProps) {
  const [asking, setAsking] = useState(false);

  if (asking) {
    return (
      <View className="flex-row items-center gap-[16px] pt-[4px]">
        <Text className="font-inter text-[12.5px] text-ink-soft">Remove this?</Text>
        <Pressable
          onPress={() => {
            setAsking(false);
            onConfirm();
          }}
          disabled={isBusy}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text className="font-poppins-semibold text-[12.5px] text-danger">Yes, remove</Text>
        </Pressable>
        <Pressable onPress={() => setAsking(false)} hitSlop={8} accessibilityRole="button">
          <Text className="font-poppins-medium text-[12.5px] text-ink-soft">Keep</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => setAsking(true)}
      hitSlop={8}
      accessibilityRole="button"
      className="self-start pt-[4px]"
    >
      <Text className="font-poppins-medium text-[12.5px] text-muted">Remove</Text>
    </Pressable>
  );
}
