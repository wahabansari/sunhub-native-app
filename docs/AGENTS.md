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

## Required task workflow

Read documents in this order before changing code. Read each applicable file
from top to bottom once and retain its rules for the task:

1. `AGENTS.md` — task-wide rules and required sequence.
2. `docs/AGENTS.md` — canonical engineering rules.
3. `docs/REFERENCE-INTEGRATION.md` — reference-app and API porting rules.
4. The relevant domain docs: `ARCHITECTURE.md`, `API.md`, `AUTH.md`,
   `ENVIRONMENT.md`, `STYLING.md`, and `TESTING.md`.
5. The matching source files in the read-only `D:\Sunhub\sunhub3.0` reference.

Do not repeatedly reread the full documentation on every small edit. If context
starts becoming uncertain, stop implementation, reread the relevant document
from the beginning, and then continue. Do not compensate for missing context by
guessing.

### Scope gate before implementation

At the start of every task, write a short scope note before editing:

```text
Goal:
In scope:
Out of scope:
Affected domains/files:
Reference files and contracts:
User decisions required:
Verification plan:
```

Ask the user all questions that materially affect architecture, UX, API
contracts, permissions, data ownership, or destructive changes. Do not begin
implementation while a required decision is unanswered. Show the planned scope
and wait for confirmation when the request is ambiguous. Do not push or claim
completion until the user has reviewed the result and is satisfied.

Before implementation, identify the affected domain, source reference files,
endpoint method/path/auth requirements, request and response shapes, loading and
empty states, error states, and the tests that will prove the behavior. Keep
that contract in the relevant docs when the work introduces a reusable API or
architecture rule.

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
- Do not call APIs directly from components. Use a domain service and a typed
  mapper at the boundary.
- Treat every API response as `unknown` until runtime validation succeeds.
- Do not add an endpoint based on a guessed URL, field, or response assumption.
  Confirm it in the reference or with the backend contract first.
- Keep reference parity separate from implementation parity: preserve endpoint
  behavior and user-visible requirements, but use mobile-native TypeScript,
  Context, SecureStore, fetch, and Expo conventions.
- Update the relevant document in `docs/` when architecture, API, auth, env,
  test, or styling conventions change.

## Naming and folder structure

All new folders and source files must use lowercase kebab-case. Use the same
style for component, hook, service, mapper, context, and utility filenames:

```text
src/
  app/                  # route files only, when Expo Router is adopted
  components/           # reusable UI, grouped by feature or visual role
  config/               # public configuration parsing
  constants/            # static contracts and query-key factories
  contexts/             # cross-screen React state, grouped by domain
  errors/               # typed errors and safe user messages
  hooks/                # reusable React hooks, grouped by domain if needed
  providers/            # application-wide provider composition
  services/             # React-free domain and transport services
  theme/                # design tokens and runtime style values
  types/                # shared domain types
  utils/                # pure, dependency-light helpers
  validation/           # input and form validation
```

Examples: `product-card.tsx`, `use-product-search.ts`,
`product-service.ts`, `product-mappers.ts`, and `auth-context.tsx`. Do not add
PascalCase, camelCase, snake_case, or abbreviated folder names. Do not rename
unrelated existing files merely for style; migrate a touched area deliberately
and update imports/tests in the same change.

Never create a catch-all `helpers`, `misc`, `common`, or `components2` folder.
Place a file beside the domain that owns it. A component folder may contain a
public component plus private subcomponents only when those subcomponents are
not reusable elsewhere.

The current repository tree has been normalized to this rule. The only naming
exceptions are framework/tooling contracts that must retain their exact names:
`App.tsx`, `index.ts`, `app.json`, `tsconfig.json`, `package.json`, config files
required by their tools, and mandated documentation names such as
`docs/AGENTS.md`. Never rename these exceptions merely to satisfy kebab-case.

## Design decomposition

For every new page or substantial screen, document and implement the hierarchy
in this order before writing JSX:

```text
page/screen
  -> sections (hero, filters, results, actions, etc.)
    -> components (cards, rows, controls, banners)
      -> small primitives (label, icon button, divider, state view)
```

Each section gets a clear responsibility and a small prop contract. Split a
component when it has multiple visual responsibilities, repeated markup, its
own state, or a separately testable loading/empty/error state. Keep route files
thin; put reusable UI outside `src/app`. Record the page outline, responsive
behavior, animation boundaries, accessibility states, and data owner in the
relevant architecture or domain document.

## Implementation boundaries

- Components render props and emit user intents; they do not call `fetch`.
- Pure utilities accept values and return values; they do not read Context,
  environment variables, navigation, or network state.
- Context owns only cross-screen client state and actions; it must not become a
  dumping ground for server data that belongs in React Query.
- Services own API calls and business sequencing; mappers validate `unknown`.
- Hooks connect services to React Query or Context and expose UI-safe state.
- Query keys belong in `src/constants/query-keys.ts` and must not include
  tokens, passwords, or entire unbounded objects.
- API paths belong in `src/constants/api.ts`; never compose URLs in JSX.

Before adding a file, prove that an existing file cannot own the responsibility.
Before adding a dependency, document the concrete problem and verify the Expo
SDK compatibility. Remove unused imports, dead branches, placeholder files,
duplicate components, and speculative abstractions before handoff.

## Focused cleanup and verification

Clean the files and dependencies touched by the task before completion. Fix
warnings and suggestions in those files, but do not perform an unrelated
repository-wide cleanup unless the user explicitly requests it. Do not delete
working code merely because it is not currently rendered; first confirm its
ownership and references. Run the narrowest relevant tests during iteration,
then the required checks in the Testing section before handoff.

## Error-handling rules

Every feature must define and test these boundaries:

- **Transport:** timeout, cancellation, network failure, serialization failure,
  invalid JSON, and non-2xx status become typed `AppError` values.
- **Domain:** a successful HTTP response with an invalid or rejected payload is
  mapped to a domain-specific error; never return partially trusted data.
- **Session:** 401 clears or revalidates the local session according to the
  domain contract; never retry indefinitely.
- **Authorization:** 403 becomes a safe permission state, not a raw server
  message.
- **Validation:** 4xx validation errors become safe field or form messages
  without exposing payloads or credentials.
- **UI:** screens render loading, empty, success, retry, and safe error states;
  they do not parse HTTP responses or log tokens.

Never swallow an error silently. If a remote failure is intentionally
non-blocking, log only safe metadata and document why the user can continue.

## Styling

- NativeWind 4 (Tailwind CSS 3) is the styling system. Use `className` on React
  Native components; do not add a second styling library.
- `tailwind.config.js` mirrors `src/theme/tokens.ts` (`colors`, `spacing`,
  radii, and typography). Change both together.
- Import `global.css` once, from `App.tsx`. Do not import it from `index.ts` or
  from multiple modules.
- Use only the approved design tokens documented in [STYLING.md](STYLING.md):
  `primary`, `primary-light`, `accent`, `ink`, `price`, `surface`, `border`,
  `success`, and `on-primary`. Avoid raw palette and arbitrary values.
- Every component state must use a documented token. Do not invent colors for
  loading, empty, disabled, validation, or error states.
- Use `StyleSheet` for runtime-computed values, animated styles, or third-party
  components that reject `className`.
- Run `npm run format` after editing class strings so
  `prettier-plugin-tailwindcss` sorts them.
- NativeWind CSS is not processed in Vitest (`test.css` is disabled), and no
  `react-native-css-interop` test setup is needed.
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

- `src/services/auth/auth-service.ts` owns the auth use cases.
- `src/services/storage/session-storage.ts` is the only module that reads or
  writes the secure session.
- `src/services/api/api-client.ts` handles transport, timeouts, and HTTP errors. It
  does not validate endpoint payload shapes.
- `src/contexts/auth/auth-provider.tsx` owns auth UI state and delegates work to
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
- Add new variables to `src/config/env-schema.ts`, `src/config/env.ts`,
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

Vitest is the test runner. RNTL 14 APIs are asynchronous. Always `await render(...)`,
`await fireEvent.press(...)`, and `await renderHook(...)`. Read the installed
package docs before changing test setup.

Vitest uses the Node environment with React Native Testing Library's Test
Renderer. Component tests do not require a browser DOM or a device; mock native
modules at their boundaries when a test needs them.

Run before declaring work complete:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
# warn when a feature has no test files
npm run test:guard
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
