import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme/tokens';

import { SUNHUB_LOGO_PATHS, SUNHUB_LOGO_VIEWBOX } from './sunhub-logo-paths';

type Props = { height?: number };

export function SunhubLogo({ height = 24 }: Props) {
  const width = (height * SUNHUB_LOGO_VIEWBOX.width) / SUNHUB_LOGO_VIEWBOX.height;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${SUNHUB_LOGO_VIEWBOX.width} ${SUNHUB_LOGO_VIEWBOX.height}`}
      accessibilityLabel="Sunhub"
      role="img"
    >
      {SUNHUB_LOGO_PATHS.map((d) => (
        <Path key={d.slice(0, 24)} d={d} fill={colors.ink} fillRule="evenodd" />
      ))}
    </Svg>
  );
}
