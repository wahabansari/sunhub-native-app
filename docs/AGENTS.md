# Agent Instructions

This file is the source of truth for engineering work in this repository. The
root `AGENTS.md` is a short pointer plus environment reminders.

## Project scope

This repository is the Expo/React Native foundation for a mobile dashboard. It
currently contains infrastructure, not product features. Do not invent screens,
dashboards, forms, navigation flows, or business rules that were not requested.

The web reference at `../sunhub3.0` is read-only. Never edit it, copy secrets from
it, or import from it. Reuse a source behavior only after confirming it is in
scope and documenting the port.

## Read installed documentation first

Expo and React Native change between releases. Before using an Expo, EAS, or
React Native API:

1. Read the `expo` version in `package.json`.
2. Fetch `https://docs.expo.dev/versions/v<major>.0.0/` for that SDK.
3. Use `https://docs.expo.dev/llms.txt` as the index and follow specific pages.
4. Read package-local docs for testing libraries, for example
   `node_modules/@testing-library/react-native/docs/`.

Do not answer API questions from memory when versioned docs are available.

## Environment

- Expo SDK: see `package.json`.
- TypeScript strict mode is required.
- Path alias: `@/*` maps to `src/*`.
- Node.js 22.13+ within the 22.x line, or 24+; required by the installed testing
  stack.
- Use `npm` unless a lockfile switch is explicitly requested.
- Install native packages with `npx expo install <package>`.
- Prefer Expo modules and the smallest dependency set.

## Code rules

- TypeScript only for source and tests. No JavaScript source files except config.
- Keep every handwritten source or test file at or below 300 lines; prefer 200.
- Do not put `sunhub` in internal folder, module, component, hook, or utility
  names. The app identity and package name are the only exceptions.
- Use functional components and hooks.
- Use Context API for shared state. Do not add Redux, Zustand, MobX, Jotai, or a
  query cache unless a concrete requirement justifies the dependency.
- Keep local UI state local. Put cross-screen state in a context.
- Keep services independent of React. UI may depend on services; services must
  not import components, screens, contexts, or hooks.
- Validate unknown API payloads at service boundaries. Do not trust `as` casts.
- Never expose tokens through context, props, logs, or error messages.
- Never log request bodies, credentials, tokens, or raw auth payloads.
- User-facing errors must use `AppError.userMessage` or a safe fallback.
- Add or update tests for behavior changes.
- Update the relevant document in `docs/` when architecture, API, auth, env,
  test, or styling conventions change.

## Styling

- NativeWind 4 (Tailwind CSS 3) is the styling system. Use `className` on React
  Native components; do not add a second styling library.
- `tailwind.config.js` mirrors `src/theme/tokens.ts` (`colors`, `spacing`,
  radii, and typography). Change both together.
- Import `global.css` once, from `App.tsx`. Do not import it from `index.ts` or
  from multiple modules.
- Use semantic token classes (`bg-background`, `text-text`, `text-muted`). Avoid
  raw palette and arbitrary values when a token exists.
- Use `StyleSheet` for runtime-computed values, animated styles, or third-party
  components that reject `className`.
- Run `npm run format` after editing class strings so
  `prettier-plugin-tailwindcss` sorts them.
- Do not add `react-native-css-interop/test/setupAfterEnv` on Jest 30.
- See [STYLING.md](STYLING.md) for the token map and test setup. Dark mode is not
  configured yet; add `darkColors` and `dark:` variants when requested later.

## Architecture boundaries

```text
App.tsx
  -> src/providers        composition root
  -> src/contexts         shared React state
  -> src/hooks            context accessors and reusable hooks
  -> src/services         API, auth, storage, logging
  -> src/errors           typed errors and safe messages
  -> src/config           validated public configuration
  -> src/utils            pure helpers
  -> src/types            shared types
```

- `src/services/auth/authService.ts` owns the auth use cases.
- `src/services/storage/sessionStorage.ts` is the only module that reads or
  writes the secure session.
- `src/services/api/client.ts` handles transport, timeouts, and HTTP errors. It
  does not validate endpoint payload shapes.
- `src/contexts/auth/AuthProvider.tsx` owns auth UI state and delegates work to
  `AuthService`.
- `AuthContext` deliberately does not expose the access token.

## Navigation

No navigation library is installed yet. The foundation has no screens or routes,
so adding one now would exceed scope.

When navigation is requested, use Expo Router, following the versioned Expo
docs. If `src/app` is adopted for routes, keep non-route code outside it. The
current `src/providers` folder exists so that `src/app` remains free for future
routes.

## Environment variables

- Only `EXPO_PUBLIC_*` variables are available to app code.
- Expo inlines these values into the JavaScript bundle. They are public.
- Never migrate private keys, credentials, or secrets from the web app.
- Reference variables statically as `process.env.EXPO_PUBLIC_*`; dynamic access
  is not replaced at build time.
- Add new variables to `src/config/envSchema.ts`, `src/config/env.ts`,
  `.env.example`, and `docs/ENVIRONMENT.md`.
- Invalid configuration must fail fast with `ConfigError`.

## Authentication rules

- Login: `POST /v1/client/login`.
- Profile: `GET /v1/client/my-profile/edit` with a bearer token.
- Logout: `POST /v1/client/logout` with a bearer token.
- Persist only `{ accessToken, roles }` in SecureStore.
- Re-fetch profile data on restore; never trust cached profile details.
- Clear the stored session on 401 during restore and treat the user as signed out.
- Local sign-out must clear storage even when the remote logout call fails.
- Do not add refresh-token, social-login, guest-login, or registration flows
  without a dedicated request.
- Do not claim SecureStore makes environment variables secret. It protects the
  token at rest on the device; it does not protect bundled configuration.

## Testing

Use these terms:

- **Unit test**: pure functions and reducers.
- **Component test**: React components and context providers with React Native
  Testing Library.
- **Integration test**: multiple modules with mocked boundaries (for example,
  auth service + API client + storage).
- **E2E test**: a real app build on a device or simulator. None exist yet.

RNTL 14 APIs are asynchronous. Always `await render(...)`,
`await fireEvent.press(...)`, and `await renderHook(...)`. Read the installed
package docs before changing test setup.

Run before declaring work complete:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test -- --runInBand
# or all of the above:
npm run verify
```

Do not start the Expo dev server, an emulator, a simulator, or a physical device
as part of routine coding work unless the user explicitly asks.

## Commands

```bash
npm install
cp .env.example .env.local
npm run typecheck
npm run lint
npm run format
npm run format:check
npm test
npm run test:coverage
npm run verify
```

Use `npx expo install <package>` for Expo dependencies, `npx expo-doctor` for
dependency diagnostics, and `npx expo install --fix` for SDK compatibility.
Do not create or edit `ios/` or `android/` by hand; use app config and config
plugins when native folders are eventually generated.
