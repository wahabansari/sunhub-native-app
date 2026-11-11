import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconDef = {
  paths: string[];
  circles?: [number, number, number][];
  rects?: [number, number, number, number, number][];
  filled?: boolean;
};

const ICONS = {
  user: { paths: ['M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7'], circles: [[12, 8, 4]] },
  bell: { paths: ['M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4'] },
  cart: {
    paths: ['M2.5 3.5h3l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2'],
    circles: [
      [9, 20, 1.5],
      [18, 20, 1.5],
    ],
  },
  search: { paths: ['m20 20-3.5-3.5'], circles: [[11, 11, 7]] },
  sliders: {
    paths: ['M4 7h9M17 7h3M4 17h3M11 17h9'],
    circles: [
      [15, 7, 2],
      [9, 17, 2],
    ],
  },
  scale: {
    paths: ['M12 3v18M5 8h14M5 8l-2.5 6a3 3 0 0 0 5 0zM19 8l-2.5 6a3 3 0 0 0 5 0zM8 21h8'],
  },
  pin: {
    paths: ['M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z'],
    circles: [[12, 9.5, 2.5]],
  },
  calculator: {
    paths: ['M8.5 7.5h7M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01'],
    rects: [[5, 3, 14, 18, 2]],
  },
  chevron: { paths: ['m9 5 7 7-7 7'] },
  back: { paths: ['m15 5-7 7 7 7'] },
  down: { paths: ['m6 9 6 6 6-6'] },
  close: { paths: ['M6 6l12 12M18 6 6 18'] },
  chat: {
    paths: [
      'M21 12C21 16.4 17.2 20 12.5 20H7L3 22L4.2 17.8C2.8 16.3 2 14.3 2 12C2 7.6 5.8 4 12.5 4C17.2 4 21 7.6 21 12Z',
    ],
  },
  doc: {
    paths: [
      'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z',
      'M14 3v5h5M9 13h6M9 17h6',
    ],
  },
  check: { paths: ['m5 12.5 4.5 4.5L19 7.5'] },
  plus: { paths: ['M12 5v14M5 12h14'] },
  minus: { paths: ['M5 12h14'] },
  shield: {
    paths: [
      'M12 3 4.5 6v5.5c0 4.6 3.1 8 7.5 9.5 4.4-1.5 7.5-4.9 7.5-9.5V6z',
      'm9 12 2.2 2.2L15.5 10',
    ],
  },
  layers: { paths: ['m12 3 9 5-9 5-9-5z', 'm3 13 9 5 9-5'] },
  trend: { paths: ['m3 17 6-6 4 4 8-8', 'M15 7h6v6'] },
  sun: {
    paths: [
      'M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8',
    ],
    circles: [[12, 12, 4]],
  },
  mail: { paths: ['m3 7 9 6 9-6'], rects: [[3, 5, 18, 14, 2]] },
  lock: { paths: ['M8 11V8a4 4 0 0 1 8 0v3'], rects: [[5, 11, 14, 10, 2]] },
  eye: { paths: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z'], circles: [[12, 12, 3]] },
  eyeOff: {
    paths: [
      'M3 3l18 18',
      'M10.6 5.1A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.7 8.5 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4.4-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2',
    ],
  },
  phone: {
    paths: [
      'M5 4h3.5l1.8 4.5-2.2 1.4a11 11 0 0 0 5.5 5.5l1.4-2.2 4.5 1.8V18.5a1.5 1.5 0 0 1-1.6 1.5C10.7 19.5 4.5 13.3 4 5.6A1.5 1.5 0 0 1 5 4z',
    ],
  },
  building: {
    paths: ['M9 8h.01M15 8h.01M9 12h.01M15 12h.01M10 21v-4h4v4'],
    rects: [[5, 3, 14, 18, 1.5]],
  },
  star: {
    paths: ['M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z'],
    filled: true,
  },
} as const satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 22, color, strokeWidth = 1.9 }: Props) {
  const def: IconDef = ICONS[name];
  const fill = def.filled ? color : 'none';
  const stroke = def.filled ? 'none' : color;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      {def.rects?.map(([x, y, w, h, rx]) => (
        <Rect
          key={`r-${x}-${y}`}
          x={x}
          y={y}
          width={w}
          height={h}
          rx={rx}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ))}
      {def.circles?.map(([cx, cy, r]) => (
        <Circle
          key={`c-${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={r}
          stroke={stroke}
          fill={fill}
          strokeWidth={strokeWidth}
        />
      ))}
      {def.paths.map((d) => (
        <Path
          key={d}
          d={d}
          stroke={stroke}
          fill={fill}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
