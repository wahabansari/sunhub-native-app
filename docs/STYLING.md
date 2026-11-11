# Styling

NativeWind 4 is the styling system for this app. It compiles Tailwind CSS 3
utilities into React Native styles, so components are styled with `className`
instead of `StyleSheet`. `StyleSheet` is still allowed where a utility cannot
express the requirement, such as the error boundary fallback or values computed
at runtime.

## Stack

| Package                          | Role                                         |
| -------------------------------- | -------------------------------------------- |
| `nativewind` 4.2.7               | Tailwind runtime and Babel/Metro integration |
| `tailwindcss` 3.4                | Utility generation and theme configuration   |
| `react-native-reanimated` 4.7.1  | NativeWind peer dependency                   |
| `react-native-worklets` 0.13.0   | Reanimated 4 peer dependency                 |
| `react-native-safe-area-context` | NativeWind peer dependency                   |
| `prettier-plugin-tailwindcss`    | Sorts class names during `npm run format`    |

NativeWind v5 is a release candidate and is intentionally not used. Stay on the
v4 line until a stable v5 is released and a migration is requested.

## Files

```text
babel.config.js       babel-preset-expo with jsxImportSource + nativewind/babel
metro.config.js       withNativeWind(config, { input: './global.css' })
tailwind.config.js    content globs, NativeWind preset, app theme tokens
global.css            @tailwind base, components, utilities
nativewind-env.d.ts   /// <reference types="nativewind/types" />
App.tsx               imports global.css once at the top of the module
```

Import `global.css` in the top-level component file (`App.tsx`), not in
`index.ts`. NativeWind documents this placement so Fast Refresh keeps working.

Do not import `global.css` from more than one module.

## Design tokens

The mobile artifact's explicit token panel is the source of truth. It defines
ten named colors; white is also explicitly required for primary text and
icons. Therefore the approved palette contains eleven distinct colors:

| Token          | Hex       | Use                          | Approved components and states                                                      |
| -------------- | --------- | ---------------------------- | ----------------------------------------------------------------------------------- |
| `primary`      | `#FF6B00` | Main action and brand orange | Primary buttons, active tabs, selected controls, sticky CTAs, focused action states |
| `primaryLight` | `#FFEDD9` | Soft primary tint            | Selected chips, light tabs, add-to-cart buttons, soft action backgrounds            |
| `accent`       | `#FDBA74` | Secondary orange emphasis    | Badges, highlights, progress accents, supporting emphasis near primary actions      |
| `ink`          | `#1A2B3C` | Main readable text and icons | Headings, body text, labels, navigation, default icon state                         |
| `price`        | `#C95200` | Price and monetary emphasis  | Product prices, deal prices, savings, offer amounts, monetary warning copy          |
| `surface`      | `#F5F6F8` | Light app and card surface   | Screen background, cards, sheets, input backgrounds, neutral containers             |
| `border`       | `#E5E7EB` | Subtle separation            | Card borders, dividers, input outlines, inactive control boundaries                 |
| `success`      | `#16A34A` | Positive status              | Success badges, confirmed/paid/delivered states, completion feedback                |
| `danger`       | `#DC2626` | Destructive and error state  | Error messages, delete confirmations, failed states, form validation errors         |
| `send`         | `#2563EB` | Send and primary action blue | Send message buttons, blue call-to-action controls                                  |
| `onPrimary`    | `#FFFFFF` | Contrast on primary          | Text and icons placed directly on `primary` backgrounds                             |

### Strict usage policy

- These are the only approved design colors. Do not add raw hex values, CSS
  color names, Tailwind palette colors, gradients, dark-mode colors, or new
  semantic colors without an updated design reference and documentation.
- `primary` is for actions and selected states, not large body copy.
- `primaryLight` is for a soft background behind a primary-related control;
  use `primary` for the actual action text or icon.
- `price` is reserved for money, deal emphasis, savings, and monetary warning copy.
- `success` is reserved for positive outcomes. Do not use it for generic
  decoration.
- `danger` is reserved for destructive actions, error states, and failed
  operation feedback. Do not use it for general emphasis or warnings.
- `send` is reserved for send/submit CTAs and blue primary action controls.
  Do not use it interchangeably with `primary`.
- `onPrimary` is the only approved color for content directly on `primary`.
- Opacity modifiers such as `text-ink/70` are allowed only when the base token
  remains one of the approved colors and the reduced contrast is intentional.
- Every new component must document which token it uses for default, selected,
  disabled, loading, success, empty, and error states that apply to it.

Use semantic classes such as `bg-primary`, `bg-surface`, `text-ink`,
`text-price`, `text-success`, `text-danger`, `text-send`, `border-border`, and
`text-on-primary`. Never use `bg-[#...]`, `text-gray-*`, `text-white`, or
equivalent raw palette utilities.

The Tailwind theme must mirror `src/theme/tokens.ts` exactly. When a token
changes, update both files in the same change and run `npm run format`.

## Conventions

- Prefer `className` for layout, spacing, color, and typography.
- Keep local UI state local; styling is not state.
- Use static class strings, or a small explicit map when a class is conditional.
  Do not assemble class names from user input.
- Use `StyleSheet` for runtime-computed values, animated styles, or
  third-party components that reject `className`.

## Testing

- Vitest runs with `test.css: false`; tests must not parse real CSS.
- No `react-native-css-interop` test setup is needed. The Reanimated/CSS
  interop runtime is intentionally outside the Vitest test environment.
- Component tests assert visible text and accessible roles. NativeWind passes
  `className` through to the rendered component; computed style assertions are
  brittle and usually unnecessary.

## Native runtime notes

NativeWind is JavaScript, but Reanimated, Worklets, and safe-area-context ship
native code. Expo Go includes a fixed set of native modules for the current SDK;
if your target runtime does not include one of them, use a development build. Run
`npx expo-doctor` after changing dependencies.

The web target uses Metro (`web.bundler` in `app.json`), which is required by
`withNativeWind`.

## Verification

Dependencies must be installed before styling can be type-checked or formatted:

```bash
npm install
npm run verify
```

`npm run typecheck` relies on `nativewind-env.d.ts` to add `className` to React
Native component props.
