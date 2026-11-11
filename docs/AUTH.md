# Authentication

## Scope

The app implements email/password sign-in (bearer token, profile verification,
secure session restore, sign-out) plus the account flows around it:
registration, resend verification email, forgot password and reset password.
Screens live in `src/screens/auth/` and are routed from `src/app/`.

Still intentionally not ported from the web reference:

- Google and Facebook sign-in.
- Guest sign-in and guest-chat conversion.
- Seller-specific sign-in entry points.
- Analytics events and cross-tab session broadcasting.

They can be added later as separate, reviewed changes. Their source behavior
should not be assumed to be correct for mobile.

## Screens and flow

| Route              | Screen                 | Notes                                                               |
| ------------------ | ---------------------- | ------------------------------------------------------------------- |
| `/login`           | `LoginScreen`          | Email + password. `?redirect=` returns to the screen that asked.    |
| `/register`        | `RegisterScreen`       | Buyer/Seller/Both, then a "check your email" confirmation.          |
| `/forgot-password` | `ForgotPasswordScreen` | Sends the reset email, then offers "I have my reset link".          |
| `/reset-password`  | `ResetPasswordScreen`  | Opened by deep link, or paste the emailed link.                     |
| `/account`         | `AccountScreen`        | Signed-in summary and sign-out; redirects to login when signed out. |

- Guest cart items move into the account cart after sign-in; see [CART-CHECKOUT.md](CART-CHECKOUT.md).
- The home header profile button opens `/account` when signed in, else `/login`.
- `useRequireAuth()` gates chat, offers and cart. It sends signed-out users to
  `/login?redirect=<path>`; after sign-in the login screen redirects there.
- `safeRedirect()` only accepts in-app paths (no scheme, no `//`, never an auth
  route), so a crafted link cannot send a user elsewhere after sign-in.
- Login HTTP 403 (email not verified) is `AUTH_UNVERIFIED`: the login screen shows
  the server message with a "Resend verification email" action. 400/401/422 are
  `AUTH_FAILED` with a generic invalid-credentials message.
- Reset links: the web link is
  `https://www.sunhub.com/password/reset?email=…&token=…`. The app handles the
  `sunhub://reset-password?email=…&token=…` deep link and, for web links, lets
  the user paste the link (`parseResetLink` accepts only `sunhub.com` hosts and the
  app scheme). Universal links need associated-domain configuration and a
  development build; they are not configured yet.

### Account endpoints

| Step                | Method | Path                        | Body                                                                                                             |
| ------------------- | ------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Register            | POST   | `/v1/client/signup`         | `role`, `firstname`, `companyname?`, `email`, `phone` (digits), `password`, `password_confirmation`, `agreement` |
| Resend verification | POST   | `/v1/client/email/resend`   | `email`, `password`                                                                                              |
| Forgot password     | POST   | `/v1/client/password/email` | `email`                                                                                                          |
| Reset password      | POST   | `/v1/client/password/reset` | `email`, `token`, `password`, `password_confirmation` (+ bearer `token`)                                         |

All four are handled by `createAccountService` (`src/services/auth/account-service.ts`).
Rejections use the API's `errors` (list or field map) via `parseServerErrors`; 5xx
bodies are never shown. The web reference sends the reset token both in the body
and as a bearer header; the mobile service mirrors that because the server
contract is not otherwise documented. Registration does not sign the user in:
they must verify their email first.

## Endpoints

| Step    | Method | Path                         | Auth   |
| ------- | ------ | ---------------------------- | ------ |
| Login   | POST   | `/v1/client/login`           | No     |
| Profile | GET    | `/v1/client/my-profile/edit` | Bearer |
| Logout  | POST   | `/v1/client/logout`          | Bearer |

The `/v1` prefix is configured through `EXPO_PUBLIC_API_VERSION`; service paths
are relative.

## Sign-in sequence

```text
signIn(credentials)
  -> POST login
  -> require status === true and data.auth.access_token
  -> read roles from data.role
  -> GET profile with bearer token
  -> require data.status === "active"
  -> build AuthUser from profile
  -> persist { accessToken, roles }
  -> logger.info("User signed in", { roles })
  -> return AuthUser
```

Failure behavior:

- Missing token or malformed success payload: `AUTH_INVALID_RESPONSE`.
- Rejected login payload: `AUTH_FAILED` with a safe message.
- Login HTTP 401: `AUTH_FAILED` with an invalid-credentials message.
- Profile HTTP 401: `AUTH_INVALID_SESSION`; the token is not persisted.
- Inactive profile: `AUTH_INACTIVE`; the token is not persisted.
- Storage write failure: `STORAGE`; the user is not considered signed in.

Profile verification happens before persistence. A token is stored only after it
has been proven to load an active profile.

## Session restore

```text
restoreSession()
  -> storage.read()
  -> no session: return null
  -> GET profile with stored token
  -> inactive profile: clear storage, return null
  -> 401: clear storage, return null
  -> other error: propagate to AuthProvider
  -> active profile: build AuthUser(profile, stored roles)
```

Profile fields are always re-fetched. The stored roles are used for the initial
`AuthUser` so role-gated UI can render without a second source of truth. If the
stored role list is empty, profile roles are used.

`AuthProvider` converts restore failures into a safe state message and becomes
`unauthenticated`. The app does not keep a stale user on a failed restore.

## Sign-out

```text
signOut()
  -> storage.read()
  -> if a session exists: POST logout with bearer token
  -> remote failure is logged, not surfaced
  -> storage.clear() in finally
  -> AuthProvider becomes unauthenticated
```

A remote sign-out failure never leaves the local token on the device. If
`storage.clear()` itself fails, the service throws `STORAGE`, and the provider
stays authenticated with a safe error. That is intentional: the app must not
claim the local session is gone when it could not delete the token.

## Persistence

Only this value is stored, under `auth.session.v1`:

```ts
interface StoredSession {
  accessToken: string;
  roles: string[];
}
```

Storage rules:

- SecureStore is used through `src/services/storage/session-storage.ts`.
- The value is JSON-serialized.
- Malformed or missing-token values are treated as signed out and deleted
  best-effort.
- Read, write, and delete failures become `STORAGE` errors.
- Profile details, passwords, and refresh tokens are never stored.

`expo-secure-store` uses the iOS Keychain and Android Keystore. It is a native
module. The web target is not a supported auth-persistence target without a
separate storage adapter.

## Context contract

`AuthContext` exposes:

```ts
interface AuthContextValue {
  state: AuthState;
  signIn(credentials: SignInCredentials): Promise<boolean>;
  signOut(): Promise<void>;
  clearError(): void;
}
```

The access token is deliberately absent. Components use the user snapshot,
status, and actions only. This prevents accidental rendering or logging of the
token and keeps credential handling inside the service layer.

`useAuth()` throws when called outside `AuthProvider`.

## Roles

Roles are strings from `data.role`. The foundation defines known values in
`src/constants/app.ts`:

```ts
USER_ROLES = { customer, seller, reseller };
```

Role helpers live in `src/utils/roles.ts`. Do not treat the constant list as an
authorization decision; the server remains authoritative. Role checks in the UI
only decide what to show, never what the API will allow.

## Security model

- Mobile env values are public. There are no auth secrets in the app bundle.
- SecureStore protects the token at rest, not from a compromised device or a
  rooted/jailbroken runtime.
- HTTPS is required for production API traffic. The client accepts `http://`
  only so local development can use a local server.
- Bearer tokens must never appear in logs, analytics, crash reports, or error
  messages.
- The logger redacts keys containing `token`, `password`, `secret`,
  `authorization`, or `credential`, but callers must still avoid logging raw
  payloads.
- There is no refresh-token flow. A 401 during restore signs the user out
  locally. If refresh support is added later, it must use a reviewed design and
  store refresh material securely.
- Do not add biometrics, certificate pinning, or jailbreak detection without a
  dedicated requirement and platform review.

## Source reference notes

The web reference implements sign-in in `src/api/auth/signin.js` and sign-out in
`src/api/auth/signout.js`. It:

- Calls `POST /v1/client/login`, loads the profile, and accepts only
  `profile.data.status === "active"`.
- Stores the full login payload and profile in `localStorage`.
- Relies on Redux actions and web-only side effects (analytics, chat cleanup,
  cross-tab synchronization).

The mobile foundation preserves the endpoint contract, active-status rule, and
token/profile order, but replaces web storage and Redux with SecureStore and
Context. No web-specific side effect was ported.

## Testing

- Mappers: unit tests with valid, malformed, and rejected payloads.
- Auth service: integration tests with a fake API client and fake storage.
- Auth provider: component tests with a fake `AuthService`.
- Storage: integration tests with a mocked SecureStore module.

See [TESTING.md](TESTING.md).
