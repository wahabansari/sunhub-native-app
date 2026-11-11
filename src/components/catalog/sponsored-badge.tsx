import { Text, View } from 'react-native';

import { Icon } from '@/components/icons/icon';

const STAR_COLOR = '#E8A100';

type Props = { label?: string };

export function SponsoredBadge({ label = 'Sponsored' }: Props) {
  return (
    <View className="absolute left-[8px] top-[8px] h-[22px] max-w-[88%] flex-row items-center gap-[4px] rounded-full bg-sponsor-bg px-[10px]">
      <Icon name="star" size={10} color={STAR_COLOR} />
      <Text className="shrink font-inter-medium text-[11px] text-sponsor-ink" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
