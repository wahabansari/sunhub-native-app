# API

## Base URL

`src/services/api/index.ts` builds the client from validated env values:

```text
baseUrl      EXPO_PUBLIC_API_BASE_URL (trailing slashes removed)
apiVersion   EXPO_PUBLIC_API_VERSION (defaults to /v1)
path         endpoint path from API_ENDPOINTS (grouped by domain)
```

`buildApiUrl('https://api.example.com', '/v1', '/client/login')` produces:

```text
https://api.example.com/v1/client/login
```

Endpoint paths in `src/constants/api.ts` are relative to the version segment.
Main API paths start with `/`; broker paths intentionally omit the leading slash
because the broker base already ends at `/api`.

The complete reference registry is grouped as `auth`, `catalog`, `account`,
`commerce`, `content`, `store`, `orders`, and `broker`. External, non-Sunhub
URLs are kept separately in `EXTERNAL_ENDPOINTS`. This registry is the only
place where endpoint paths may be added. A registry entry does not imply that a
screen is implemented: each feature still needs a typed service, mapper, hook,
tests, and a documented auth/method contract.

## Client

`src/services/api/api-client.ts` exposes:

```ts
interface ApiClient {
  request<T>(options: ApiRequestOptions): Promise<T>;
}

interface ApiRequestOptions {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
}
```

Behavior:

- JSON request bodies are serialized once; unserializable bodies become a
  `REQUEST_SERIALIZATION` error.
- `Accept: application/json` is sent by default.
- `Content-Type: application/json` is added when a body is present.
- A non-empty token is sent as `Authorization: Bearer <token>`.
- Every request has a timeout (default 60 seconds) implemented with
  `AbortController`.
- A caller-provided `AbortSignal` also cancels the request.
- Empty response bodies return `undefined`.
- Non-JSON response bodies become a `PARSE` error.
- HTTP failures become an `HTTP` error with the status and a safe user message.

The client returns parsed JSON as `T`. It does **not** validate endpoint-specific
shapes. Services must validate payloads before use.

## Endpoints

| Method | Path                      | Auth   | Purpose               |
| ------ | ------------------------- | ------ | --------------------- |
| POST   | `/client/login`           | No     | Sign in               |
| GET    | `/client/my-profile/edit` | Bearer | Load the current user |
| POST   | `/client/logout`          | Bearer | Sign out              |

The web reference uses `/v1` for these paths; the version segment is supplied by
`EXPO_PUBLIC_API_VERSION`.

### Homepage data

`src/services/home/home-service.ts` keeps the homepage transport and mapping
logic outside the screen. It calls the configured main API for catalog data and
the optional broker API for marketplace inventory:

API-backed screen hooks use TanStack React Query. The shared client caches
successful responses for five minutes, retains unused results for thirty
minutes, retries transient failures twice, and exposes `refetch()` for manual
refresh. See [QUERY.md](QUERY.md) for the required pattern.

| Method | Base       | Path                                                                         | Purpose                 |
| ------ | ---------- | ---------------------------------------------------------------------------- | ----------------------- |
| POST   | Main API   | `/client/items/search`                                                       | Fixed-price products    |
| POST   | Main API   | `/client/brands/search`                                                      | Brand catalog           |
| GET    | Broker API | `/listing/featured-deals?listing_type=panels`                                | Featured trader deals   |
| GET    | Broker API | `/broker/sidebar_data?key=homepage`                                          | Pickup-map state counts |
| GET    | Broker API | `/listing/recent-deals?listing_type=panels`                                  | Recent deals            |
| GET    | Broker API | `/listing/public/deals?page=1&sort=recommended&homePage=true&isHotDeal=true` | Hot deal                |
| GET    | WordPress  | `https://www.sunhub.com/blog/wp-json/wp/v2/posts?per_page=6&page=1&_embed`   | Latest articles         |

The broker base is configured with `EXPO_PUBLIC_BROKER_API_BASE_URL` and is called
with the `/v1` version segment (unversioned broker paths return 404).
The pickup map reads `data.state.data[{ state, count }]` from `broker/sidebar_data`,
the same source the web map uses to colour states. Deal images come from
`attachments` (type `Image`) when `images` is empty.

Listing screens add: `POST /client/items/search` (filters via `where`, `where_has` and
`like`; `pagination` in the response), `GET listing/public/deals` with
`limit/page/listing_type/state/brand/condition/search`, `GET listing/:listingId` for a
deal, and a product detail read through `items/search` filtered by `uuid` (the
`/client/items/:uuid` payload has no images or brand). Filter options come from
`broker/sidebar_data` and `POST /client/brands/search`.

The broker is optional: if it is absent, the broker-backed sections show their empty
state. Each home section (featured, pickup, buy direct, recent, spotlight, brands,
articles) is its own query in `src/hooks/use-home-sections.ts` with a 20 second request
timeout, so a slow or failing endpoint shows that section's skeleton and then a message
with a Retry button, without blocking the rest of the page. Failures are logged with
safe metadata, and pulling down on the home screen refetches every section. The articles
section falls back to a bundled list when the blog is down.
Every response is treated as `unknown` and normalized before rendering; a
partial failure never takes down the entire screen.

Buy-direct products use the reference request contract: active, approved items
with inventory, related images/category/brand data and `id DESC` ordering. The home
slider asks for up to 6 sponsored products (`is_featured_product = 1`, any category)
and falls back to the newest in-stock products when none are running. Product
discounts are calculated from `discount_unit` (`percent` or `fixed`) before display.
The local pickup section loads the deals of the selected state with
`listing/public/deals?state=XX`.

The current mobile services implement authentication and the homepage data
contract. The remaining registry entries are intentionally transport-ready,
not falsely presented as finished features. Port them incrementally with a
request type, response mapper, service, React Query hook, tests, and endpoint
documentation. Never expose the reference client's callback/Redux patterns in
the mobile app.

### Login

Request:

```json
{
  "email": "person@example.test",
  "password": "example"
}
```

Expected success shape (validated by `parseLoginResponse`):

```json
{
  "status": true,
  "data": {
    "auth": { "access_token": "..." },
    "role": ["customer"]
  }
}
```

Notes:

- `status` must be exactly `true`.
- The access token must be a non-empty string at `data.auth.access_token`.
- `data.role` is parsed as an array of strings; non-string entries are dropped.
- A rejected response (`status` not `true`) uses the first available message from
  `data.error`, `data.message`, or `data.errors`, with a safe fallback.
- A 401 is mapped to an invalid-credentials message.

### Account flows

Register, resend verification, forgot password and reset password use the
endpoints listed in [AUTH.md](AUTH.md#account-endpoints). Error bodies are read by
`src/services/api/error-payload.ts`: `errors` may be a list of strings or a map
of field name to list of strings, with `message`/`error` as a fallback. The API
client attaches those messages (`serverMessages`, `fieldErrors`) to `AppError`
for 4xx responses only.

### Listing filters

Shop (`client/items/search`) and trader (`listing/public/deals`) filters are
built from one `FilterSelection` by `buildProductBody` / `buildDealQuery`
(`src/services/catalog/listing-queries.ts`). Filter option lists come from
`client/brands/search`, `client/categories/search` (sub-categories),
`client/sectors-count`, and the broker `broker/sidebar_data`.

### Profile

Expected success shape (validated by `parseProfileResponse`):

```json
{
  "status": true,
  "data": {
    "status": "active",
    "email": "person@example.test",
    "firstname": "Test",
    "lastname": "User",
    "role": ["customer"]
  }
}
```

Notes:

- The profile status is required.
- Email, first name, and last name default to empty strings when absent.
- Both `firstname`/`lastname` and `first_name`/`last_name` are accepted.
- A profile is active only when its status is case-insensitively `active`.

### Logout

Request body: `{}`. The bearer token is sent in the header.

The client treats any HTTP error as a normal service failure. The auth service
logs a warning and still clears the local session.

## Response envelope

The backend commonly returns:

```ts
interface ApiEnvelope<T> {
  status?: boolean;
  message?: string;
  code?: number | string;
  error?: string;
  errors?: string[];
  data?: T;
}
```

Not every endpoint populates every field. Treat the value as unknown until a
mapper validates it.

## Error codes

| Code                    | Meaning                                       |
| ----------------------- | --------------------------------------------- |
| `CONFIG`                | Invalid public configuration                  |
| `NETWORK`               | Request could not reach the server            |
| `TIMEOUT`               | Request exceeded its timeout                  |
| `ABORTED`               | Request was cancelled by the caller           |
| `HTTP`                  | Non-2xx response                              |
| `PARSE`                 | Response body was not valid JSON              |
| `REQUEST_SERIALIZATION` | Request body could not be serialized          |
| `AUTH_FAILED`           | Login or auth response rejected               |
| `AUTH_INACTIVE`         | Profile is not active                         |
| `AUTH_INVALID_RESPONSE` | Auth payload failed shape validation          |
| `AUTH_INVALID_SESSION`  | Newly issued token could not load a profile   |
| `STORAGE`               | Secure storage read/write/delete failed       |
| `UNKNOWN`               | Unexpected non-`AppError` value at a boundary |

HTTP status mapping for user messages:

| Status | Message                        |
| ------ | ------------------------------ |
| 401    | Session expired; sign in again |
| 403    | No permission                  |
| 404    | Resource not found             |
| 429    | Too many requests              |
| 5xx    | Server unavailable             |
| Other  | Generic request failure        |

## Adding an endpoint

1. Add or reuse the relative path in the correct `API_ENDPOINTS` domain.
2. Add request and response types under `src/types/`.
3. Add a mapper that validates `unknown` and throws `AUTH_INVALID_RESPONSE` or a
   domain-specific `AppError`.
4. Add a service function that calls `api.request<unknown>` and passes the
   payload through the mapper.
5. Wrap the service in a hook using the shared key factory in
   `src/constants/query-keys.ts`.
6. Keep transport concerns in the client, not in screens.
7. Add unit tests for the mapper and integration tests for the service with a
   fake `ApiClient`.
8. Document the endpoint here.

## Security rules

- Never log tokens, passwords, request bodies, or raw auth payloads.
- Never surface raw server messages unless they are explicitly safe.
- Do not send the access token anywhere except the configured API base URL.
- Env values used to build URLs are public. Do not put secrets in them.
- The API client does not retry automatically. Add retries only with an explicit
  requirement and bounded attempts.
