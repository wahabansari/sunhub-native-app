import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/icon';
import { colors } from '@/theme/tokens';
import type { FilterSection, FilterSelection } from '@/types/listing';

const SHEET_HEIGHT_RATIO = 0.86;
const OPEN_MS = 320;
const CLOSE_MS = 240;
const VISIBLE_OPTIONS = 6;
const MAX_SEARCH_RESULTS = 80;

type SectionProps = {
  section: FilterSection;
  selected: string[];
  open: boolean;
  onToggleOpen: () => void;
  onPick: (value: string) => void;
};

function SectionBlock({ section, selected, open, onToggleOpen, onPick }: SectionProps) {
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const needle = query.trim().toLowerCase();
  const isLong = section.options.length > VISIBLE_OPTIONS;
  const matches = section.options.filter(
    (option) => !needle || option.label.toLowerCase().includes(needle),
  );
  const visible = needle
    ? matches.slice(0, MAX_SEARCH_RESULTS)
    : showAll
      ? matches
      : matches.slice(0, VISIBLE_OPTIONS);
  const hiddenCount = matches.length - visible.length;

  return (
    <View className="border-b border-[#EEF0F3]">
      <Pressable
        onPress={onToggleOpen}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        className="min-h-[50px] flex-row items-center gap-sm"
      >
        <Text className="flex-1 font-poppins-semibold text-[14.5px] text-ink">{section.title}</Text>
        {selected.length ? (
          <View className="h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary-light px-[5px]">
            <Text className="font-inter-bold text-[11px] text-primary">{selected.length}</Text>
          </View>
        ) : null}
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Icon name="down" size={18} color={colors.faint} />
        </View>
      </Pressable>
      {open ? (
        <View className="gap-[10px] pb-md">
          {isLong ? (
            <View className="h-10 flex-row items-center gap-sm rounded-full bg-chip px-[14px]">
              <Icon name="search" size={16} color={colors.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={`Search ${section.title.toLowerCase()}`}
                placeholderTextColor={colors.faint}
                autoCorrect={false}
                accessibilityLabel={`Search ${section.title}`}
                className="flex-1 font-inter text-[13.5px] text-ink"
              />
            </View>
          ) : null}
          <View className="flex-row flex-wrap gap-sm">
            {visible.map((option) => {
              const on = selected.includes(option.value);
              return (
                <Pressable
                  key={option.value}
                  onPress={() => onPick(option.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  className={`h-[34px] flex-row items-center gap-[6px] rounded-full border px-[12px] ${
                    on ? 'border-primary bg-primary-light' : 'border-[#D9DDE3] bg-white'
                  }`}
                >
                  <Text
                    className={`font-inter-medium text-[13px] ${on ? 'text-primary' : 'text-[#374151]'}`}
                  >
                    {option.label}
                  </Text>
                  {option.count !== undefined ? (
                    <Text
                      className={`font-inter text-[11px] ${on ? 'text-primary' : 'text-faint'}`}
                    >
                      {option.count}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
            {!visible.length ? (
              <Text className="font-inter text-[13px] text-muted">No matches.</Text>
            ) : null}
          </View>
          {isLong && !needle && (hiddenCount > 0 || showAll) ? (
            <Pressable
              onPress={() => setShowAll((value) => !value)}
              hitSlop={8}
              accessibilityRole="button"
              className="self-start"
            >
              <Text className="font-poppins-medium text-[13px] text-primary">
                {showAll ? 'See less' : `See more (${hiddenCount})`}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

type BodyProps = {
  title: string;
  buildSections: (draft: FilterSelection) => FilterSection[];
  normalize: (selection: FilterSelection) => FilterSelection;
  selection: FilterSelection;
  onApply: (selection: FilterSelection) => void;
  onClose: () => void;
};

function SheetBody({ title, buildSections, normalize, selection, onApply, onClose }: BodyProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const sheetHeight = Math.round(height * SHEET_HEIGHT_RATIO);
  const progress = useSharedValue(0);
  const closing = useRef(false);
  const [draft, setDraft] = useState<FilterSelection>(selection);
  const sections = buildSections(draft);
  const [openKey, setOpenKey] = useState<string | null>(sections[0]?.key ?? null);

  useEffect(() => {
    progress.set(withTiming(1, { duration: OPEN_MS, easing: Easing.out(Easing.cubic) }));
  }, [progress]);

  const finish = (after: () => void) => {
    if (closing.current) return;
    closing.current = true;
    progress.set(withTiming(0, { duration: CLOSE_MS, easing: Easing.in(Easing.cubic) }));
    setTimeout(after, CLOSE_MS);
  };

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.get()) * sheetHeight }],
  }));

  const pick = (section: FilterSection, value: string) => {
    setDraft((previous) => {
      const current = previous[section.key] ?? [];
      const exists = current.includes(value);
      const next = section.multiple
        ? exists
          ? current.filter((entry) => entry !== value)
          : [...current, value]
        : exists
          ? []
          : [value];
      return normalize({ ...previous, [section.key]: next });
    });
  };

  return (
    <View className="flex-1 justify-end">
      <Animated.View
        className="absolute inset-0 bg-black/45"
        style={backdropStyle}
        pointerEvents="none"
      />
      <Pressable
        className="absolute inset-0"
        onPress={() => finish(onClose)}
        accessibilityRole="button"
        accessibilityLabel="Close filters"
      />
      <Animated.View
        className="overflow-hidden rounded-t-[24px] bg-white"
        style={[{ height: sheetHeight }, sheetStyle]}
      >
        <View className="mb-[6px] mt-[10px] h-1 w-10 self-center rounded-full bg-border" />
        <View className="flex-row items-center px-md pb-sm">
          <Text className="flex-1 font-poppins-semibold text-[18px] text-ink">{title}</Text>
          <Pressable
            onPress={() => finish(onClose)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close"
            className="h-9 w-9 items-center justify-center rounded-full bg-chip"
          >
            <Icon name="close" size={18} color={colors.ink} />
          </Pressable>
        </View>
        <ScrollView
          className="flex-1 px-md"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section) => (
            <SectionBlock
              key={section.key}
              section={section}
              selected={draft[section.key] ?? []}
              open={openKey === section.key}
              onToggleOpen={() => setOpenKey((key) => (key === section.key ? null : section.key))}
              onPick={(value) => pick(section, value)}
            />
          ))}
        </ScrollView>
        <View
          className="flex-row gap-[10px] border-t border-[#EEF0F3] bg-white px-md pt-[12px]"
          style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
        >
          <Pressable
            onPress={() => setDraft({})}
            accessibilityRole="button"
            className="h-[46px] items-center justify-center rounded-full border border-[#D1D5DB] px-lg active:bg-chip"
          >
            <Text className="font-poppins-semibold text-[14px] text-ink">Clear all</Text>
          </Pressable>
          <Pressable
            onPress={() => finish(() => onApply(draft))}
            accessibilityRole="button"
            className="h-[46px] flex-1 items-center justify-center rounded-full bg-primary active:bg-primary-pressed"
          >
            <Text className="font-poppins-semibold text-[14px] text-white">Apply filters</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

type Props = Omit<BodyProps, 'title'> & { title?: string };

/** Mount it when opening and unmount in `onClose` / `onApply`; it animates in and out by itself. */
export function FilterSheet({ title = 'Filters', ...rest }: Props) {
  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={rest.onClose}
    >
      {/* A Modal is its own native root, so it needs its own safe-area provider for correct insets. */}
      <SafeAreaProvider>
        <SheetBody title={title} {...rest} />
      </SafeAreaProvider>
    </Modal>
  );
}
