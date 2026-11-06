# Migration Notes

## Reference project

The mobile foundation was derived from the web reference at
`D:\Sunhub\sunhub3.0`. That project was read only. No files, environment values,
or secrets were copied into this repository.

Reference stack:

- Next.js 16.3.8, React 19.2.8.
- JavaScript only; no TypeScript.
- Redux, Redux Toolkit, and redux-persist.
- axios.
- Ant Design, styled-components, Tailwind, and web-only UI libraries.
- `localStorage` for auth and profile persistence.
- No test script or visible test suite in `package.json`.

Target stack:

- Expo SDK 58.0.23.
- React Native 0.88.1, React 19.3.0.
- TypeScript 6.0.3 with strict mode.
- Context API plus `useReducer`.
- Fetch plus `AbortController`.
- `expo-secure-store`.
- Jest 30 and React Native Testing Library 14.

The target was scaffolded with the blank TypeScript template. Expo Router was
not included because the current scope has no screens or navigation.

## What was ported

| Source area                | Target area                                  | Notes                                                   |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------- |
| Login/profile/logout calls | `src/services/auth/`                         | Same endpoint paths and active-profile rule             |
| Response handling          | `src/services/auth/authMappers.ts`           | Runtime validation instead of trusting response objects |
| Auth endpoint constants    | `src/constants/api.ts`                       | Only the three endpoints in scope                       |
| Pagination helper          | `src/utils/pagination.ts`                    | Pure TypeScript, tested                                 |
| Deal/promotion pricing     | `src/utils/pricing.ts`                       | Pure TypeScript, tested                                 |
| Compliance helpers         | `src/utils/compliance.ts`                    | Pure TypeScript, tested                                 |
| Role names                 | `src/constants/app.ts`, `src/utils/roles.ts` | Known roles only; server remains authoritative          |
| Session storage concern    | `src/services/storage/sessionStorage.ts`     | SecureStore instead of `localStorage`                   |

## What was intentionally not ported

- Redux store, slices, selectors, and persistence middleware.
- axios interceptors and the source error-toast pipeline.
- Ant Design, styled-components, Tailwind, and other web UI dependencies.
- Next.js routing, server components, and web-only layout code.
- Google and Facebook authentication.
- Guest login, guest-chat conversion, and chat redirects.
- Registration, forgot/reset password, and resend verification.
- Seller-specific sign-in entry points.
- Analytics, toast notifications, cross-tab session sync, and browser history.
- Any source `.env` value or key material.
- Any dashboard, listing, checkout, messaging, or account feature.

These flows need a dedicated product requirement and a mobile-specific review.
They are not missing by accident.

## Key adaptations

### State management

The web app uses Redux for global auth and other application state. The mobile
foundation uses a focused `AuthContext` with a reducer. The auth state is small
and session-scoped, so a global store would add dependencies and indirection
without a current need.

If a second independent shared domain appears, add a separate context rather than
a generic global store. Revisit that decision only when the requirement is clear.

### Persistence

The web app stores the login payload and profile in `localStorage`. The mobile
app stores only:

```ts
{ accessToken: string; roles: string[] }
```

in `expo-secure-store` under `auth.session.v1`. Profile details are re-fetched
after restore. This avoids stale profile data and reduces the amount of sensitive
data at rest.

`expo-secure-store` is native-only. A web build would need a different storage
adapter before auth persistence could work there.

### Networking

The web app uses axios with shared interceptors. The mobile app uses a small
typed fetch client with:

- `AbortController` timeouts.
- Caller cancellation.
- JSON parsing with explicit parse errors.
- Safe HTTP error messages.
- No automatic retries.
- No token logging.

Endpoint payloads are typed as `unknown` until a mapper validates them. This is
stricter than the source, which reads nested fields directly.

### Authentication

The source sign-in flow calls login, then profile, then checks
`profile.data.status === "active"`. The mobile service preserves that order and
also refuses to persist a token until the profile check succeeds.

The source does not show a refresh-token exchange in the inspected auth flow. The
mobile foundation therefore treats a 401 during restore as a signed-out state
and clears the stored session. No refresh flow was invented.

### Error handling

The source shows toasts for many failures. The mobile foundation returns
`AppError` values with stable codes and safe user messages. UI callers decide how
to present them; the foundation only renders one bootstrap status message.

## Security decisions

- Mobile environment variables are public. No source env value was migrated.
- No secrets exist in the app bundle by design.
- Only the access token and cached roles are persisted.
- The token is not exposed through context or props.
- Logger redaction covers keys containing token/password/secret/authorization/
  credential.
- Raw auth payloads and request bodies are never logged.
- Remote logout failure does not keep the local token.
- The foundation accepts `http://` base URLs for local development only;
  production should use HTTPS.

## Known gaps

- No product screens or navigation.
- No refresh-token handling.
- No biometric unlock or additional token protection.
- No E2E test harness or native build verification.
- No web storage adapter.
- No retry/backoff policy for transient API failures.
- No request cancellation UI; the client supports cancellation but no screen
  consumes it yet.
- No internationalization, analytics, or push notifications.
- No image, listing, chat, checkout, or dashboard domain modules.

## Verification performed

The following were run in the target repository:

```text
npm run typecheck     pass
npm run lint          pass
npm run format:check  pass after formatting
npm test -- --runInBand
  18 suites passed, 79 tests passed
```

No Expo dev server, emulator, simulator, or physical device was started.
`npm audit` reported 31 transitive vulnerabilities (1 low, 30 moderate; no high
or critical) at the time of the foundation work. Re-run it before release; do not
apply breaking major upgrades just to clear transitive advisories without
reviewing compatibility.

## Next work

When product scope is approved:

1. Choose and add navigation with Expo Router.
2. Define screen-level state and forms.
3. Add domain services and mappers with tests.
4. Add E2E coverage once a stable device and backend target exist.
5. Review token lifetime, refresh strategy, and logout behavior with the backend
   owners.
