# Architecture

## Purpose

This repository is a reusable Expo/React Native foundation for a mobile
dashboard client. It intentionally contains no product screens. The entry point
renders a bootstrap status view so session restore and error handling can be
exercised without inventing features.

The foundation was derived by inspecting the web reference at `../sunhub3.0`.
The source project was not modified.

The reference is a behavior and contract source, not a codebase to copy. The
mobile architecture ports applicable product domains and API contracts through
typed services, runtime mappers, Context state, SecureStore, fetch, and
React Native UI boundaries. See [REFERENCE-INTEGRATION.md](REFERENCE-INTEGRATION.md).

## Runtime composition

```text
index.ts
  registers App
    App.tsx
      AppProviders
        ErrorBoundary
          AuthProvider(service = authService)
            bootstrap view
              useAuth()
```

`src/providers/app-providers.tsx` is the composition root. It constructs no
services directly; `src/services/auth/index.ts` wires the API client, logger, and
secure storage into `authService`. This keeps the UI independent of concrete
transport and storage implementations.

## Layers

```text
src/
  components/     reusable visual primitives
  config/         env parsing and validation
  constants/      app, API, storage keys
  contexts/       shared React state
  errors/         typed errors and user-safe messages
  hooks/          context accessors and reusable hooks
  providers/      app-wide provider composition
  services/       API, auth, storage, logging
  theme/          design tokens (mirrored in tailwind.config.js)
  types/          shared types
  utils/          pure helpers
  validation/     form-level validation
```

Dependency direction:

```text
UI -> hooks/contexts -> services -> config/errors -> utils/types
```

Server state uses TanStack React Query. `AppProviders` in `app-providers.tsx` owns the single
`QueryClient`; domain hooks own query keys and call React-free services. Local
UI state remains in components, while query caching, retries, stale data, and
refetching remain in React Query. See [QUERY.md](QUERY.md).

Services must not import React components, screens, contexts, or hooks. Pure
utilities must not import services. This keeps business logic testable without a
renderer and makes future screens thin.

## Feature and page structure

New work is organized by responsibility, not by whichever file is easiest to
add first. Use lowercase kebab-case for every new folder and file. A page is
planned and built in this sequence:

```text
route/page
  -> page sections
    -> feature components
      -> focused visual primitives
```

For example, a product page may become `product-page.tsx`,
`product-hero.tsx`, `product-summary.tsx`, and `product-price.tsx`. The route
owns composition, sections own layout/data coordination, components own a
single visual responsibility, and primitives own small repeated UI. Keep
feature-specific pieces together until they are genuinely reused. Do not make
one giant screen file or split every text node into a component.

Use this ownership table when deciding where code belongs:

| Concern                   | Location                                 | Rule                           |
| ------------------------- | ---------------------------------------- | ------------------------------ |
| Route composition         | `src/app/`                               | Expo Router files only         |
| Visual UI                 | `src/components/<feature>/`              | Props in, user intents out     |
| Server state              | `src/services/<feature>/` + `src/hooks/` | Service validates; hook caches |
| Client cross-screen state | `src/contexts/<feature>/`                | Context plus focused reducer   |
| Pure transformation       | `src/utils/` or feature mapper           | No React, API, or env access   |
| API paths                 | `src/constants/api.ts`                   | No URL literals in UI          |
| Query keys                | `src/constants/query-keys.ts`            | Stable, bounded, non-sensitive |

Every page plan must name its sections, component boundaries, data source,
loading/empty/error/retry states, animation ownership, and tests before JSX is
written. This keeps the UI scalable and lets an agent work on one section
without losing the page contract.

For each API-backed feature, use this flow:

```text
screen/component
  -> hook or focused context
  -> domain service
  -> API client
  -> runtime mapper (unknown -> domain type)
  -> safe AppError on failure
```

No component may construct endpoint URLs, attach bearer tokens, parse response
envelopes, or decide transport retry behavior.

For query-backed data, use the single `QueryClient` from `AppProviders`, a
stable key from `src/constants/query-keys.ts`, a React-free service, and a hook
that exposes safe UI state. Mutations invalidate the smallest related key after
success. Context is reserved for client state such as session or a cross-screen
draft; do not duplicate React Query data in Context.

## Auth state

`src/contexts/auth/auth-reducer.ts` defines four values:

```ts
interface AuthState {
  status: 'initializing' | 'authenticated' | 'unauthenticated';
  user: AuthUser | null;
  error: string | null;
  isSubmitting: boolean;
}
```

Transitions:

```text
initializing
  -> RESTORE_SUCCEEDED(user)  -> authenticated
  -> RESTORE_SUCCEEDED(null)  -> unauthenticated
  -> RESTORE_FAILED(message)  -> unauthenticated + error

unauthenticated
  -> SIGN_IN_STARTED          -> isSubmitting = true
  -> SIGN_IN_SUCCEEDED(user)  -> authenticated
  -> SIGN_IN_FAILED(message)  -> unauthenticated + error

authenticated
  -> SIGN_OUT_STARTED         -> isSubmitting = true
  -> SIGN_OUT_SUCCEEDED       -> unauthenticated
  -> SIGN_OUT_FAILED(message) -> stays authenticated + error
```

`AuthState.user` is an `AuthUser` snapshot. It contains profile fields and roles,
never the access token. The token exists only inside the auth service and the
secure-session store.

## Session lifecycle

1. `AuthProvider` mounts and calls `AuthService.restoreSession()`.
2. `sessionStorage.read()` reads `auth.session.v1` from SecureStore.
3. If no session exists, the provider becomes `unauthenticated`.
4. If a session exists, the service calls the profile endpoint with the bearer
   token.
5. An active profile produces an `AuthUser` and the provider becomes
   `authenticated`.
6. An inactive profile or a 401 clears storage and signs the user out locally.
7. Other restore errors leave the user signed out and expose a safe message.

Sign-in performs login, profile verification, active-status check, then storage
write. Storage is written only after the session is known to be valid.

Sign-out attempts the remote logout call, logs but does not surface a remote
failure, and always clears local storage in `finally`.

See [AUTH.md](AUTH.md) for endpoint details and security decisions.

## Error handling

- `AppError` carries a stable code, optional HTTP status, a developer message,
  and a `userMessage` safe for display.
- `toUserMessage()` converts any thrown value into a display-safe string.
- `ErrorBoundary` catches render failures and reports them to the logger.
- The API client maps timeout, abort, network, parse, serialization, and HTTP
  failures into `AppError` without exposing raw response bodies.
- `AuthProvider` catches service errors and stores only user-safe messages.

## Configuration

`src/config/env-schema.ts` is a pure parser. `src/config/env.ts` is the only file
that reads `process.env.EXPO_PUBLIC_*`. Invalid values throw `ConfigError` during
module initialization, which fails fast instead of producing confusing runtime
behavior.

See [ENVIRONMENT.md](ENVIRONMENT.md).

## Styling

NativeWind 4 (Tailwind CSS 3) is the styling layer. Components use `className`,
and the Tailwind theme in `tailwind.config.js` mirrors the design tokens in
`src/theme/tokens.ts` (`colors`, `spacing`, `radii`, and `typography`). The two
files must be updated together. The approved palette and component-state rules
are documented in [STYLING.md](STYLING.md); no component may introduce colors
outside that allowlist.

- `babel.config.js` adds `jsxImportSource: 'nativewind'` and the NativeWind
  Babel preset.
- `metro.config.js` wraps the Expo config with `withNativeWind` and points at
  `global.css`.
- `App.tsx` imports `global.css` once, at the top of the module.
- `app.json` uses the Metro web bundler and the native plugins required by the
  setup.
- `StyleSheet` remains valid for runtime-computed values and the
  `ErrorBoundary` fallback, which does not depend on Tailwind.
- Vitest runs in the Node environment with CSS processing disabled. React Native
  Testing Library uses its Test Renderer, so component tests do not require a
  browser DOM or a device.

See [STYLING.md](STYLING.md) for tokens, conventions, and testing notes.

## Design decisions

- **Expo blank TypeScript template.** No router or screen structure is needed in
  the current scope.
- **Context API.** Shared auth state is small and local to the session domain.
  Redux or a query cache would add dependencies without a current requirement.
- **Fetch instead of axios.** The API client needs JSON, bearer auth, timeouts,
  and abort support. `fetch` and `AbortController` cover that with no dependency.
- **SecureStore instead of AsyncStorage.** Only credential material is
  persisted, and it belongs in platform secure storage.
- **Persist roles.** Role-gated UI can render immediately after a cold start
  while the profile is re-fetched. Profile fields are never trusted from disk.
- **No token in context.** Components cannot accidentally log or render it.
- **Vitest + RNTL 14.** Tests use Vitest with RNTL's async APIs required by React 19 and the current
  renderer.
- **NativeWind 4, not v5.** v5 is a release candidate. v4 is the stable line and
  keeps the Tailwind 3 configuration the app already documents.
- **Tailwind theme mirrors `tokens.ts`.** Tailwind is the source of truth for
  class-based styles; `tokens.ts` stays for `StyleSheet` and programmatic values.

## Future extension points

- **Navigation:** add Expo Router only when screens are requested. Keep routes in
  `src/app` and non-route code outside it.
- **New API endpoints:** add the path to `src/constants/api.ts`, add a typed
  mapper/service, and validate unknown payloads at the boundary.
- **New shared state:** add a focused context and reducer, not a global store.
- **Forms:** add screen-local form state and validation; reuse
  `src/validation/auth.ts` patterns.
- **Feature flags:** treat them as public `EXPO_PUBLIC_*` configuration, never as
  secrets.
- **Navigation guards:** derive visibility from `useAuth().state` and roles. Do
  not expose the token to guards.

## File size policy

Every handwritten source and test file must stay at or below 300 lines, with 200
preferred. Split by responsibility when a file approaches the limit. Do not split
purely to satisfy a line count if the result hides a cohesive unit.
