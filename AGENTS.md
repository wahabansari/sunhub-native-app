# Agent Instructions

Canonical engineering instructions live in [docs/AGENTS.md](docs/AGENTS.md).
Read that file before changing code. This root file only highlights the rules
that apply to every task.

## Required reading

- [docs/AGENTS.md](docs/AGENTS.md) — scope, architecture, code, auth, env, tests.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/STYLING.md](docs/STYLING.md)
- [docs/API.md](docs/API.md)
- [docs/AUTH.md](docs/AUTH.md)
- [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)
- [docs/TESTING.md](docs/TESTING.md)

The web reference at `../sunhub3.0` is read-only. Do not edit it or copy secrets
from it.

## Expo documentation

Expo ships breaking changes every SDK release. Before using an Expo, EAS, or
React Native API:

1. Read the `expo` version in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`.
3. Use `https://docs.expo.dev/llms.txt` as the index, then read the specific page.
4. Read package-local docs for libraries, such as
   `node_modules/@testing-library/react-native/docs/`.

Do not rely on memory for version-specific APIs.

## Commands

```bash
npx expo install <package>  # always use for Expo dependencies
npm run typecheck
npm run lint
npm run format:check
npm test -- --runInBand
npm run verify              # all checks
```

Use `npx expo-doctor` for dependency diagnostics and `npx expo install --fix` to
align package versions. Do not start the Expo dev server, an emulator, a
simulator, or a device unless the user explicitly asks.

## Navigation

No navigation library is installed yet because this repository is a foundation
with no product screens. When navigation is requested, use Expo Router and the
matching versioned docs. Keep non-route code outside `src/app`; the current
provider composition lives in `src/providers`.

## Rules

- Keep handwritten source and test files at or below 300 lines; prefer 200.
- Use TypeScript strict mode and the `@/*` path alias.
- Use Context API for shared state; no Redux, Zustand, or MobX without a concrete
  justification.
- `EXPO_PUBLIC_*` values are bundled and public. Never put secrets in them.
- Never expose access tokens through context, props, or logs.
- Do not create or edit `ios/` or `android/` by hand; configure native behavior
  in `app.json` and config plugins when native folders are generated.
- Expo Go only includes bundled native modules. Native libraries require a
  development build.
