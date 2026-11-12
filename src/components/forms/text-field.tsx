import { useState, type ComponentRef, type Ref } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Icon, type IconName } from '@/components/icons/icon';
import { colors } from '@/theme/tokens';

export type TextFieldHandle = ComponentRef<typeof TextInput>;

type Props = Omit<TextInputProps, 'style' | 'secureTextEntry' | 'placeholderTextColor'> & {
  label: string;
  icon: IconName;
  error?: string;
  /** Masks the value and shows a show/hide toggle. */
  secret?: boolean;
  required?: boolean;
  prefix?: string;
  inputRef?: Ref<TextFieldHandle>;
};

export function TextField({
  label,
  icon,
  error,
  secret = false,
  required = false,
  prefix,
  inputRef,
  onFocus,
  onBlur,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const borderClass = error ? 'border-danger' : focused ? 'border-primary' : 'border-[#D9DDE3]';

  return (
    <View className="gap-[6px]">
      <Text className="font-inter-medium text-[13px] text-ink-soft">
        {label}
        {required ? <Text className="text-danger"> *</Text> : null}
      </Text>
      <View
        className={`h-[50px] flex-row items-center gap-[10px] rounded-[14px] border bg-white px-[14px] ${borderClass}`}
      >
        <Icon name={icon} size={18} color={focused ? colors.primary : colors.muted} />
        {prefix ? (
          <Text className="font-inter-medium text-[15px] text-ink-soft">{prefix}</Text>
        ) : null}
        <TextInput
          {...inputProps}
          ref={inputRef}
          secureTextEntry={secret && !revealed}
          placeholder={inputProps.placeholder ?? `Enter ${label.toLowerCase()}`}
          placeholderTextColor={colors.faint}
          accessibilityLabel={label}
          autoCorrect={false}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          className="h-full flex-1 font-inter text-[15px] text-ink"
        />
        {secret ? (
          <Pressable
            onPress={() => setRevealed((value) => !value)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
          >
            <Icon name={revealed ? 'eyeOff' : 'eye'} size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" className="font-inter text-[12.5px] text-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
