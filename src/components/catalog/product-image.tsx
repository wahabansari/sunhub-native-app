import { Image, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { colors } from '@/theme/tokens';

type Props = {
  uri?: string;
  label: string;
  /** Space kept around the picture; `top` leaves room for a badge. */
  inset?: { top?: number; x?: number; bottom?: number };
  fallbackSize?: number;
};

/**
 * Fills its (relatively positioned) parent and fits the picture inside it without distortion.
 * The picture multiplies with the tile colour, so white photo backgrounds disappear.
 */
export function ProductImage({ uri, label, inset, fallbackSize = 36 }: Props) {
  const padding = {
    paddingTop: inset?.top ?? 10,
    paddingHorizontal: inset?.x ?? 10,
    paddingBottom: inset?.bottom ?? 10,
  };

  return (
    <View className="absolute inset-0 items-center justify-center" style={padding}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%', mixBlendMode: 'multiply' }}
          resizeMode="contain"
          accessibilityLabel={label}
        />
      ) : (
        <Icon name="sun" size={fallbackSize} color={colors.border} />
      )}
    </View>
  );
}
