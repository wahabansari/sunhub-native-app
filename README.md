# Sunhub Native Dashboard App

Expo + React Native + TypeScript foundation for a mobile dashboard client. This
repository is a boilerplate layer, not a finished product: it contains API,
authentication, secure-session, error-handling, configuration, logging, and
testing infrastructure only.

## Status

- Expo SDK 58, React Native 0.88, React 19, TypeScript 6.
- NativeWind 4 (Tailwind CSS 3) for styling. Dark mode is not configured yet; it
  can be added later.
- No product screens, dashboards, forms, or navigation stack yet.
- The entry point renders a small bootstrap status view so the foundation can be
  exercised without inventing product UI.
- The web reference at `../sunhub3.0` was read as a reference and was not
  modified.

## Requirements

- Node.js 22.13+ within the 22.x line, or 24+ (required by the installed testing
  stack).
- npm 10 or newer.
- An Expo-compatible Android/iOS toolchain only when running a native build.

## Setup

```bash
npm install
cp .env.example .env.local
# edit .env.local with the API URL for your environment
```

`EXPO_PUBLIC_*` variables are inlined into the JavaScript bundle. They are
public configuration, not secrets. Never place private keys, service credentials,
or any value that must remain confidential in a mobile env file.

Styling uses NativeWind, which is compiled by Metro. Restart the dev server after
installing it, and rebuild any existing development build because Reanimated and
Worklets include native code. See [Styling](docs/STYLING.md).

## Commands

```bash
npm start             # Expo dev server (not started by tooling)
npm run android       # Expo dev server targeting Android
npm run ios           # Expo dev server targeting iOS
npm run web           # Expo dev server targeting web
npm run typecheck     # tsc --noEmit
npm run lint          # ESLint
npm run format        # Prettier write
npm run format:check  # Prettier check
npm test              # Jest
npm run test:coverage # Jest with coverage
npm run verify        # typecheck + lint + format check + tests
```

Install native packages with `npx expo install <package>` so Expo resolves
SDK-compatible versions.

## Structure

```text
App.tsx                    Minimal bootstrap view (imports global.css)
index.ts                   Root component registration
babel.config.js            Expo preset plus NativeWind JSX transform
metro.config.js            Expo Metro config wrapped with NativeWind
tailwind.config.js         Content globs and app design tokens
global.css                 Tailwind directives
nativewind-env.d.ts        NativeWind TypeScript declarations
src/providers/            App-wide provider composition
src/components/common/     Shared UI primitives (error boundary)
src/config/                Public env parsing and validation
src/constants/             App, API, and storage keys
src/contexts/auth/         Auth reducer, context, and provider
src/errors/                Typed errors and safe user messages
src/hooks/                 Shared hooks
src/services/api/          Fetch API client
src/services/auth/         Auth service and response mappers
src/services/logging/      Leveled logger with redaction
src/services/storage/      SecureStore session persistence
src/theme/                 Shared design tokens
src/types/                 Shared domain and API types
src/utils/                 Guards, formatting, roles, pricing, pagination
src/validation/            Form-level validation helpers
tests/                     Unit, component, and integration tests
docs/                      Architecture, API, auth, env, test, migration docs
```

## Documentation

- [Agent instructions](docs/AGENTS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Styling](docs/STYLING.md)
- [API](docs/API.md)
- [Authentication](docs/AUTH.md)
- [Environment](docs/ENVIRONMENT.md)
- [Testing](docs/TESTING.md)
- [Migration notes](docs/MIGRATION-NOTES.md)

## Security notes

- The access token and cached role names are the only values stored on device,
  using `expo-secure-store`. Profile data is re-fetched after restore.
- The auth context exposes the user snapshot and actions, never the token.
- Logs redact keys containing `token`, `password`, `secret`, `authorization`,
  or `credential`.
- API errors map to stable user-safe messages; raw server payloads are not
  displayed.
- Environment variables in an Expo mobile app are discoverable from the bundle.
  Treat every `EXPO_PUBLIC_*` value as public.

## Current verification

The foundation passes TypeScript, ESLint, Prettier, and Jest. See
`docs/TESTING.md` for the exact test scope and commands. No device, emulator, or
Expo dev server was started during setup.
# sunhub-native-app
