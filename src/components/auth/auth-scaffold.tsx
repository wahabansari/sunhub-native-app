import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SunhubLogo } from '@/components/home/sunhub-logo';
import { Icon } from '@/components/icons/icon';
import { colors } from '@/theme/tokens';

type Props = {
  title: string;
  subtitle: string;
  onBack: () => void;
  /** Shown below the form, usually the link to the sibling auth screen. */
  footer?: ReactNode;
  children: ReactNode;
};

/** Shared frame for every auth screen: back button, logo, heading, keyboard-aware scrolling form. */
export function AuthScaffold({ title, subtitle, onBack, footer, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View className="px-md pt-sm">
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            className="-ml-[6px] h-10 w-10 items-center justify-center rounded-full active:bg-chip"
          >
            <Icon name="back" size={22} color={colors.ink} />
          </Pressable>
          <View className="mt-[14px] gap-[6px]">
            <SunhubLogo height={26} />
            <Text
              accessibilityRole="header"
              className="mt-[18px] font-poppins-semibold text-[26px] leading-[34px] text-ink"
            >
              {title}
            </Text>
            <Text className="font-inter text-[14.5px] leading-[21px] text-muted">{subtitle}</Text>
          </View>
        </View>
        <View className="gap-[16px] px-md pt-[24px]">{children}</View>
        {footer ? <View className="items-center px-md pt-[22px]">{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
