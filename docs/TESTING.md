# Testing

## Current state

The foundation currently has no test files because it contains infrastructure
but no product pages or feature logic. New pages and features must include
Vitest tests before they are pushed.

## Test types

- **Unit test** — pure functions, parsers, reducers, mappers, and utilities.
- **Component test** — a React Native component or context provider rendered
  with React Native Testing Library (RNTL).
- **Integration test** — several real modules wired together with mocked
  boundaries, such as an auth service with a fake API client and storage.
- **E2E test** — a real build running on a device or simulator. Not configured.

RNTL 14 uses React 19's async rendering model. Always await `render`,
`renderHook`, `fireEvent`, and `act`. The installed package documentation in
`node_modules/@testing-library/react-native/docs/` is authoritative for RNTL
APIs and conventions.

## Commands

```bash
npm test
npm run test:watch
npm run test:coverage
npm run test:guard
npm run typecheck
npm run lint
npm run format:check
npm run verify
```

`npm run test:guard` scans `tests/` for `*.test.ts`, `*.test.tsx`,
`*.spec.ts`, and `*.spec.tsx`. It prints a warning and exits successfully when
none exist, so the empty foundation remains verifiable without silently hiding
the missing-test policy. When test files exist, `npm run verify` runs them with
Vitest.

## Configuration

`vitest.config.js`:

- enables global Vitest APIs;
- uses the Node environment;
- includes only `tests/**/*.{test,spec}.{ts,tsx}`;
- disables CSS processing (`test.css: false`);
- maps `@/*` to `src/*`; and
- allows an empty suite with `test.passWithNoTests: true`.

The Node environment is intentional. RNTL renders through its JavaScript Test
Renderer rather than a browser DOM, so component tests do not need `jsdom`, a
device, or a simulator. Mock native modules at the boundary when a test needs
them. The old CSS interop/Reanimated setup is not loaded by Vitest.

## Test boundaries

- Mock `expo-secure-store`, not the app's `sessionStorage`, so the real storage
  adapter remains covered.
- Inject a fake `fetch` into the API client instead of relying on global state.
- Assert user-visible outcomes and public contracts; avoid large snapshots.
- Never assert that an access token is present in context. It must not be there.

## Adding tests

1. Put pure logic tests in `tests/unit/`.
2. Put RNTL tests in `tests/component/`.
3. Put multi-module tests with mocked boundaries in `tests/integration/`.
4. Add shared doubles under `tests/fixtures/` only when needed.
5. Cover success and failure paths for behavior changes.
6. Run `npm run verify` and report the actual results.

## What is not covered

Real network calls, real SecureStore behavior, native builds, app launch, deep
links, push notifications, navigation, and E2E flows are out of scope for the
current foundation. Do not start an emulator, simulator, device, or Expo dev
server for routine unit or component work.
