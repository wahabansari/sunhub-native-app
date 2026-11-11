import { Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/icons/icon';
import { colors } from '@/theme/tokens';
import type { RegistrationRole } from '@/types/auth';

const ROLES: { value: RegistrationRole; title: string; description: string; icon: IconName }[] = [
  { value: 'customer', title: 'Buyer', description: 'I want to buy solar products', icon: 'cart' },
  { value: 'seller', title: 'Seller', description: 'I want to sell solar products', icon: 'trend' },
  { value: 'both', title: 'Both', description: 'I want to buy and sell products', icon: 'layers' },
];

type Props = {
  value: RegistrationRole;
  onChange: (role: RegistrationRole) => void;
};

export function RolePicker({ value, onChange }: Props) {
  return (
    <View className="gap-[8px]">
      <Text className="font-inter-medium text-[13px] text-ink-soft">I want to join as</Text>
      <View accessibilityRole="radiogroup" className="gap-[8px]">
        {ROLES.map((role) => {
          const on = role.value === value;
          return (
            <Pressable
              key={role.value}
              onPress={() => onChange(role.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              className={`flex-row items-center gap-[12px] rounded-[14px] border px-[14px] py-[12px] ${
                on ? 'border-primary bg-primary-light' : 'border-[#D9DDE3] bg-white'
              }`}
            >
              <View
                className={`h-9 w-9 items-center justify-center rounded-full ${on ? 'bg-white' : 'bg-chip'}`}
              >
                <Icon name={role.icon} size={18} color={on ? colors.primary : colors.muted} />
              </View>
              <View className="flex-1">
                <Text
                  className={`font-poppins-semibold text-[14.5px] ${on ? 'text-primary' : 'text-ink'}`}
                >
                  {role.title}
                </Text>
                <Text className="font-inter text-[12.5px] text-muted">{role.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
