# Environment

## Variables

Copy `.env.example` to `.env.local` for local development.

| Variable                         | Required | Default       | Purpose                                       |
| -------------------------------- | -------- | ------------- | --------------------------------------------- |
| `EXPO_PUBLIC_APP_ENV`            | No       | `development` | `development`, `staging`, or `production`     |
| `EXPO_PUBLIC_API_BASE_URL`       | Yes      | none          | API origin, with or without trailing slash    |
| `EXPO_PUBLIC_API_VERSION`        | No       | `/v1`         | Version path segment                          |
| `EXPO_PUBLIC_REQUEST_TIMEOUT_MS` | No       | `60000`       | Request timeout, 1–300000 ms                  |
| `EXPO_PUBLIC_LOG_LEVEL`          | No       | `warn`        | `debug`, `info`, `warn`, `error`, or `silent` |

Example:

```dotenv
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
EXPO_PUBLIC_API_VERSION=/v1
EXPO_PUBLIC_REQUEST_TIMEOUT_MS=60000
EXPO_PUBLIC_LOG_LEVEL=warn
```

## These values are public

Expo inlines `EXPO_PUBLIC_*` values into the JavaScript bundle at build time.
Anyone who obtains the app can recover them. They are configuration, not secrets.

Do **not** place any of the following in a mobile env file:

- API secret keys, signing keys, or private tokens.
- Database credentials.
- OAuth client secrets.
- Internal admin credentials.
- Any value the web app keeps server-side.

A mobile app cannot hold a confidential secret. If a feature needs one, put it
behind a server endpoint.

## Access rules

`src/config/env.ts` is the only collector of environment values. It references
each variable statically:

```ts
export const env = parseEnv({
  appEnv: process.env.EXPO_PUBLIC_APP_ENV,
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  apiVersion: process.env.EXPO_PUBLIC_API_VERSION,
  requestTimeoutMs: process.env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS,
  logLevel: process.env.EXPO_PUBLIC_LOG_LEVEL,
});
```

Expo's inliner does not replace dynamic access such as `process.env[key]`. Keep
new references static and add them here.

`parseEnv()` in `src/config/envSchema.ts` is pure and testable. It validates:

- `EXPO_PUBLIC_APP_ENV` is one of the allowed names.
- `EXPO_PUBLIC_API_BASE_URL` is present and starts with `http://` or `https://`.
- Trailing slashes on the base URL are removed.
- The API version is normalized to a single leading slash; empty becomes `/v1`.
- The timeout is an integer from 1 to 300000.
- The log level is one of the allowed names.

Invalid values throw `ConfigError` during module initialization. The app fails
fast instead of issuing requests to an unintended URL.

## Environment files

- `.env.example` is committed and contains placeholders.
- `.env`, `.env.local`, and other `.env.*` files are ignored by git.
- `.env.example` is explicitly un-ignored with `!.env.example`.
- Never commit a real environment file.

Expo loads `.env.local` for local commands. For EAS builds, configure the
variables in the build profile or EAS environment, not by committing a file.

## API base URL examples

```text
Local:       http://192.168.1.10:8000
Staging:     https://staging-api.example.com
Production:  https://api.example.com
```

Use an address reachable from the device or emulator. `localhost` refers to the
device itself, not the development machine. Prefer HTTPS outside local
development.

## Logging

`EXPO_PUBLIC_LOG_LEVEL` sets the minimum emitted level. `silent` disables all
output. The logger redacts values under sensitive keys, but callers must not log
request bodies or raw auth payloads.

Production should normally use `warn` or `error`. `debug` may expose operational
metadata even after redaction, so enable it deliberately.

## Changing configuration

When adding a variable:

1. Add it to `.env.example` with a safe placeholder.
2. Add it to `EnvSource` and `parseEnv()` in `src/config/envSchema.ts`.
3. Add a static reference in `src/config/env.ts`.
4. Add validation tests in `tests/unit/env.test.ts`.
5. Update this document.
6. Use the value through `env`, not directly through `process.env`, elsewhere.

If the value controls a security decision, stop and confirm it belongs on the
client at all.
