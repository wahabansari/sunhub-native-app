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

The Tailwind theme mirrors `src/theme/tokens.ts`: `colors`, `spacing`,
`radii`, and `typography`. When a token changes, update both files.

| Token                | Utility examples           |
| -------------------- | -------------------------- |
| `colors.background`  | `bg-background`            |
| `colors.surface`     | `bg-surface`               |
| `colors.text`        | `text-text`                |
| `colors.muted`       | `text-muted`               |
| `colors.primary`     | `text-primary`             |
| `colors.danger`      | `text-danger`              |
| `colors.border`      | `border-border`            |
| `spacing.xs`–`xl`    | `p-lg`, `mt-sm`, `gap-md`  |
| `radii.sm`–`lg`      | `rounded-sm`, `rounded-lg` |
| `typography.title`   | `text-title`               |
| `typography.body`    | `text-body`                |
| `typography.caption` | `text-caption`             |

Two naming quirks follow from the source token names:

- `text-title`, `text-body`, and `text-caption` set font size.
- `text-text` sets the text color because the color token is named `text`.

Use the semantic names instead of raw palette classes such as `bg-gray-100`.
Arbitrary values (`bg-[#123456]`) are a last resort; add a token instead.

## Conventions

- Prefer `className` for layout, spacing, color, and typography.
- Keep local UI state local; styling is not state.
- Use static class strings, or a small explicit map when a class is conditional.
  Do not assemble class names from user input.
- Use `StyleSheet` for runtime-computed values, animated styles, or
  third-party components that reject `className`.

## Testing

- `jest.config.js` loads `react-native-css-interop/test/setup` through
  `setupFiles`.
- `.css` imports resolve to `tests/styleMock.ts`; tests must not parse real CSS.
- Do not add `react-native-css-interop/test/setupAfterEnv` on Jest 30. It imports
  `expect/build/matchers`, which Jest 30 no longer exposes.
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
