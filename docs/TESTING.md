# Testing

## Current state

The foundation has 18 test suites and 79 passing tests at the time of writing:

- 13 unit suites.
- 2 component suites.
- 3 integration suites.

No E2E suite exists. No device, emulator, simulator, or Expo dev server was
started during the foundation work.

The web reference at `../sunhub3.0` has no visible test script or test suite in
its `package.json`; this mobile foundation does not inherit a testing setup from
it.

## Test types

Use these terms consistently:

- **Unit test** — pure functions, parsers, reducers, mappers, and utilities. No
  React renderer and no network.
- **Component test** — a React Native component or context provider rendered with
  React Native Testing Library (RNTL). Native modules are mocked.
- **Integration test** — several real modules wired together with mocked
  boundaries. For this app: auth service + API client + storage, or API client +
  fake `fetch`.
- **E2E test** — a real build running on a device or simulator against a real or
  controlled backend. Not configured here.

Do not label tests as "A/B" or use marketing-style test names.

## Commands

```bash
npm test                      # run all tests
npm test -- --runInBand       # serial, used by verify
npm run test:watch            # watch mode
npm run test:coverage         # coverage report in coverage/
npm run typecheck
npm run lint
npm run format:check
npm run verify                # typecheck + lint + format + tests
```

`npm run verify` is the required pre-completion gate. Report actual results; do
not claim a check passed without running it.

## Configuration

- `jest.config.js` uses the `jest-expo` preset with Jest 30.
- `setupFiles` loads `react-native-css-interop/test/setup` so NativeWind and
  Reanimated are mocked before the environment.
- `tests/setup.ts` is loaded after the environment. It globally mocks
  `expo-secure-store` and exposes `__reset`, `__set`, and `__get` helpers.
- `.css` imports are mapped to `tests/styleMock.ts`; tests never parse real CSS.
- Do not add `react-native-css-interop/test/setupAfterEnv`; it depends on a Jest
  API that Jest 30 removed.
- `testMatch` is limited to `tests/**/*.test.{ts,tsx}`.
- `clearMocks` is enabled.
- The `@/*` alias maps to `src/*`.
- Coverage collects from `src/**/*.{ts,tsx}`, excluding `src/types` and
  `src/index.ts` barrels.
- Tests use `test-renderer` 1.3.x, matching React 19.3.

Jest 30 is required by Expo SDK 58. Do not downgrade to Jest 29.

## RNTL 14 is asynchronous

RNTL 14 uses React 19's async rendering model. Every render and event is async:

```ts
await render(<Component />);
await fireEvent.press(screen.getByText('Submit'));
const { result } = await renderHook(() => useAuth());
```

Common mistakes:

- Calling `render()` without `await`. `screen` is not populated yet and throws
  `` `render` function has not been called ``.
- Calling `fireEvent.press()` without `await`, so state updates are not flushed.
- Using `screen` after a synchronous `render` and assuming the tree is ready.

Read the installed docs at
`node_modules/@testing-library/react-native/docs/` before changing test patterns.
The migration guide for v14 is especially relevant.

## What is covered

| Area                      | Kind        | Focus                                        |
| ------------------------- | ----------- | -------------------------------------------- |
| Env parsing               | Unit        | defaults, normalization, invalid values      |
| Guards and validation     | Unit        | unknown input handling                       |
| Formatting and pagination | Unit        | pure helpers                                 |
| Pricing and compliance    | Unit        | ported business helpers                      |
| Roles                     | Unit        | role normalization and checks                |
| Logger                    | Unit        | level filtering and redaction                |
| Errors                    | Unit        | codes and safe messages                      |
| Auth reducer              | Unit        | all state transitions                        |
| Auth mappers              | Unit        | login/profile payload validation             |
| Auth provider             | Component   | restore, sign-in, sign-out, error clearing   |
| Error boundary            | Component   | fallback rendering and error reporting       |
| API client                | Integration | fetch, timeout, abort, error mapping         |
| Session storage           | Integration | SecureStore read/write/clear and recovery    |
| Auth service              | Integration | login, restore, logout, storage coordination |

## Test boundaries

- Mock `expo-secure-store`, not the app's `sessionStorage`. This exercises the
  real storage adapter.
- Mock `fetch` through the `fetchImpl` dependency of the API client. Do not
  monkey-patch global state for integration tests when a dependency can be
  injected.
- Use `tests/fixtures/auth.ts` for auth service and provider doubles.
- Keep auth provider tests on a fake `AuthService`; do not reach into module
  singletons.
- Assert user-visible outcomes and public contracts. Avoid snapshot tests of
  large trees.
- Do not assert that the token is present in context. It must not be there.

## Adding tests

1. Put pure logic tests in `tests/unit/`.
2. Put RNTL tests in `tests/component/`.
3. Put multi-module tests with mocked boundaries in `tests/integration/`.
4. Add fixtures under `tests/fixtures/` when a double is shared.
5. Cover both success and failure paths for auth and API changes.
6. Run `npm run verify` and report the exact pass/fail counts.

## What is not covered

- Real network calls to the backend.
- Real SecureStore behavior on iOS or Android.
- Native build, app launch, deep links, or push notifications.
- Navigation; no navigation library exists yet.
- E2E flows; no E2E harness exists yet.

Add E2E coverage only when there are real screens and a stable backend target.
Do not start an emulator or device as part of routine unit or component work.
