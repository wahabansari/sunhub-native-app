import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/icon';
import { US_STATE_NAMES } from '@/constants/us-states';
import { colors } from '@/theme/tokens';

const STATES = Object.entries(US_STATE_NAMES).map(([code, name]) => ({ code, name }));

type ListProps = { onPick: (code: string) => void; onClose: () => void };

function StateList({ onPick, onClose }: ListProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? STATES.filter(
          (state) =>
            state.name.toLowerCase().includes(needle) || state.code.toLowerCase() === needle,
        )
      : STATES;
  }, [query]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-sm px-md py-sm">
        <Text className="flex-1 font-poppins-semibold text-[18px] text-ink">Choose a state</Text>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="h-9 w-9 items-center justify-center rounded-full bg-chip"
        >
          <Icon name="close" size={18} color={colors.ink} />
        </Pressable>
      </View>
      <View className="mx-md mb-sm h-10 flex-row items-center gap-sm rounded-full bg-chip px-[14px]">
        <Icon name="search" size={16} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search states"
          placeholderTextColor={colors.faint}
          autoCorrect={false}
          accessibilityLabel="Search states"
          className="flex-1 font-inter text-[14px] text-ink"
        />
      </View>
      <FlatList
        data={matches}
        keyExtractor={(state) => state.code}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPick(item.code)}
            accessibilityRole="button"
            className="flex-row items-center justify-between border-b border-[#EEF0F3] px-md py-[14px] active:bg-chip"
          >
            <Text className="font-inter text-[15px] text-ink">{item.name}</Text>
            <Text className="font-inter-medium text-[13px] text-muted">{item.code}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

type Props = {
  value: string;
  onChange: (code: string) => void;
  error?: string;
  label?: string;
};

/** A field that opens a searchable list of US states and stores the two-letter code. */
export function StatePicker({ value, onChange, error, label = 'State' }: Props) {
  const [open, setOpen] = useState(false);
  const name = value ? US_STATE_NAMES[value] : undefined;

  return (
    <View className="gap-[6px]">
      <Text className="font-inter-medium text-[13px] text-ink-soft">
        {label}
        <Text className="text-danger"> *</Text>
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${name ?? 'not chosen'}`}
        className={`h-[50px] flex-row items-center justify-between rounded-[14px] border bg-white px-[14px] ${
          error ? 'border-danger' : 'border-[#D9DDE3]'
        }`}
      >
        <Text className={`font-inter text-[15px] ${name ? 'text-ink' : 'text-faint'}`}>
          {name ?? 'Select'}
        </Text>
        <Icon name="down" size={18} color={colors.muted} />
      </Pressable>
      {error ? <Text className="font-inter text-[12.5px] text-danger">{error}</Text> : null}
      {open ? (
        <Modal visible animationType="slide" onRequestClose={() => setOpen(false)}>
          <SafeAreaProvider>
            <StateList
              onClose={() => setOpen(false)}
              onPick={(code) => {
                onChange(code);
                setOpen(false);
              }}
            />
          </SafeAreaProvider>
        </Modal>
      ) : null}
    </View>
  );
}
