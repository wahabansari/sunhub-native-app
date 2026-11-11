import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/icons/icon';

type Props = {
  checked: boolean;
  onToggle: () => void;
  error?: string;
  children: ReactNode;
};

export function CheckboxRow({ checked, onToggle, error, children }: Props) {
  return (
    <View className="gap-[6px]">
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        className="flex-row items-start gap-[10px]"
      >
        <View
          className={`mt-[1px] h-[22px] w-[22px] items-center justify-center rounded-[6px] border ${
            checked
              ? 'border-primary bg-primary'
              : error
                ? 'border-danger bg-white'
                : 'border-[#C5CBD3] bg-white'
          }`}
        >
          {checked ? <Icon name="check" size={14} color="#FFFFFF" strokeWidth={2.6} /> : null}
        </View>
        <Text className="flex-1 font-inter text-[13px] leading-[19px] text-ink-soft">
          {children}
        </Text>
      </Pressable>
      {error ? <Text className="font-inter text-[12.5px] text-danger">{error}</Text> : null}
    </View>
  );
}
