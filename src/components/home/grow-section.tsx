import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { GROW_STATS, WHY_SUNHUB } from '@/constants/home-content';
import { colors } from '@/theme/tokens';

import { SectionHeader } from './section-header';

type Props = {
  onExplore?: () => void;
  onJoin?: () => void;
};

export function GrowSection({ onExplore, onJoin }: Props) {
  return (
    <View className="pt-lg">
      <SectionHeader title="Grow with Sunhub" />
      <View className="gap-[14px] px-md">
        <View className="gap-[10px] rounded-[20px] bg-ink p-[20px]">
          <Text className="font-poppins-semibold text-[11.5px] uppercase tracking-[0.6px] text-[#FF8A3D]">
            Supplier advertising program
          </Text>
          <Text className="font-poppins-semibold text-[21px] leading-[26px] text-white">
            Reach serious buyers with Sunhub
          </Text>
          <Text className="font-inter text-[14px] leading-[21px] text-[#D1D5DB]">
            Increase your visibility, connect with serious buyers and grow your business.
          </Text>
          <View className="mb-[8px] mt-[6px] flex-row flex-wrap justify-between gap-y-[10px]">
            {GROW_STATS.map((stat) => (
              <View
                key={stat.label}
                className="w-[48.5%] gap-[2px] rounded-[14px] bg-white/[0.08] px-[14px] py-[12px]"
              >
                <Text className="font-poppins-semibold text-[22px] text-white">{stat.value}</Text>
                <Text className="font-inter text-[12px] text-[#CBD5E1]">{stat.label}</Text>
              </View>
            ))}
          </View>
          <Pressable
            onPress={onExplore}
            accessibilityRole="button"
            className="h-[42px] items-center justify-center rounded-full bg-primary active:bg-primary-pressed"
          >
            <Text className="font-poppins-semibold text-[14px] text-white">Explore more info</Text>
          </Pressable>
        </View>

        <View className="gap-[10px] rounded-[20px] border border-border bg-white p-[20px]">
          <Text className="font-poppins-semibold text-[11.5px] uppercase tracking-[0.6px] text-price">
            Why Sunhub
          </Text>
          <Text className="font-poppins-semibold text-[21px] leading-[26px] text-ink">
            A private deal platform for the solar industry
          </Text>
          <Text className="font-inter text-[14px] leading-[21px] text-muted">
            Negotiate directly with manufacturers and suppliers, away from public listings.
          </Text>
          <View className="mb-[8px] mt-[4px]">
            {WHY_SUNHUB.map((item, index) => (
              <View
                key={item.title}
                className={`flex-row items-center gap-[12px] py-[12px] ${
                  index === WHY_SUNHUB.length - 1 ? '' : 'border-b border-chip'
                }`}
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFF1E6]">
                  <Icon name={item.icon} size={18} color={colors.primary} />
                </View>
                <View className="min-w-0 flex-1 gap-px">
                  <Text className="font-poppins-semibold text-[15px] text-ink">{item.title}</Text>
                  <Text className="font-inter text-[12.5px] leading-[17px] text-muted">
                    {item.body}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <Pressable
            onPress={onJoin}
            accessibilityRole="button"
            className="h-[42px] items-center justify-center rounded-full bg-primary active:bg-primary-pressed"
          >
            <Text className="font-poppins-semibold text-[14px] text-white">Join free</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
