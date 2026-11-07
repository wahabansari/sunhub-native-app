# Reference integration

## Purpose

`D:\Sunhub\sunhub3.0` is the read-only web reference for Sunhub product
behavior and backend contracts. It is not a source to copy into this Expo app.
Use it to discover domains, routes, endpoint methods, request fields, response
shapes, role behavior, validation, loading states, and user-visible outcomes.

The mobile app must preserve the product contract where it applies while using
its own TypeScript, Expo, Context API, SecureStore, fetch client, NativeWind,
and React Native component boundaries.

Never read or copy `.env.local`, `src/env.local`, credentials, tokens, private
keys, or other secrets from the reference. Do not edit the reference tree.

## Reading sequence

For API or feature work, agents must:

1. Read root `AGENTS.md` and this document.
2. Read `docs/AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, and relevant
   domain docs.
3. Inspect `D:\Sunhub\sunhub3.0\src\constants\api.js` for endpoint names and
   paths.
4. Inspect `D:\Sunhub\sunhub3.0\src\api\` for methods, payloads, headers,
   callbacks, and response handling.
5. Inspect the relevant domain service, view, route, validation, and constants
   files for actual user behavior. Do not rely on endpoint constants alone.
6. Record the contract before coding: method, relative path, auth, request and
   response shapes, filters, pagination, roles, side effects, and failures.
7. Implement the mobile equivalent through the layers below.
8. Add tests for success, malformed responses, transport failures, 401/403,
   validation failures, empty results, retry behavior, and safe UI messaging as
   applicable.
9. Update `docs/API.md` and relevant domain documentation.

This sequence is mandatory for a first-time agent. Read the project documents
once from top to bottom before inspecting implementation files, then keep the
resulting architecture and naming rules in working context. If the task context
becomes unclear, reread only the relevant document from the beginning before
making another design decision. Never fill a missing contract with a plausible
guess.

Before implementation, require a scope note containing goal, in/out of scope,
affected files, reference contracts, unresolved user decisions, and the
verification plan. Ask the user for any answer that would change the design or
API behavior, and wait rather than silently choosing.

If the reference and backend behavior disagree, stop and record the discrepancy
instead of choosing silently.

## Reference API domains

The reference endpoint registry covers these domains:

| Domain                     | Representative reference paths                                                | Mobile port boundary                            |
| -------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------- |
| Auth and profile           | `/client/login`, `/client/signup`, `/client/my-profile/edit`, password, roles | auth and profile services, auth context         |
| Catalog discovery          | `/client/items/search`, item detail, categories, brands, sectors              | catalog service, typed filters and mappers      |
| Seller inventory           | `/client/my/items`, variants, files, locations, bulk updates                  | inventory service, upload adapter, seller state |
| Resellers                  | `/client/resellers`, reseller search, locations, inventory files              | reseller service and role-gated UI              |
| Profile data               | addresses, payment profiles, purchase history                                 | profile service and secure auth boundary        |
| Cart and checkout          | cart search/add/delete, shipping, tax, FedEx, checkout                        | cart and checkout services                      |
| Orders and fulfillment     | order status, sold items, tracking, invoices                                  | order service and status mapper                 |
| Reviews and discussion     | reviews, Q&A, product discussion                                              | review and discussion services                  |
| Wishlist and notifications | wishlist mutations, user notifications                                        | focused services and notification state         |
| Storefront                 | store front, projects, seller contact, favorites                              | storefront service                              |
| Custom orders              | custom order list/create/files/categories                                     | custom-order service                            |
| Content and marketing      | events, FAQs, banners, videos, promotions, newsletter, contact                | content services                                |
| Seller finance             | payout accounts, onboarding, account snapshot                                 | payout service; never log payment data          |
| RV and tracking            | RV surveys, source tracking                                                   | dedicated service with safe payloads            |

Canonical names and paths remain in the reference constants file. Before
porting an endpoint, confirm its HTTP method in the actual `src/api/` module;
constants alone do not define whether an endpoint uses GET, POST, PUT, or
DELETE.

## Mobile implementation pattern

For a new domain, prefer:

```text
src/types/<domain>.ts
src/services/<domain>/<domain>Service.ts
src/services/<domain>/<domain>Mappers.ts
src/constants/api.ts
src/hooks/use<Domain>.ts          # only when a hook boundary is useful
src/contexts/<domain>/            # only for cross-screen state
tests/unit/<domain>Mappers.test.ts
tests/integration/<domain>Service.test.ts
```

Keep services React-free. The API client owns transport, timeout, cancellation,
serialization, and HTTP normalization. Domain services own endpoint calls and
business sequencing. Mappers own runtime validation. Components own rendering,
user actions, and accessible states.

New implementation files use lowercase kebab-case and the feature structure
below. Do not copy the reference folder layout or its web naming conventions:

```text
src/components/<feature-name>/
  <feature-name>-page.tsx
  <feature-name>-section.tsx
  <feature-name>-card.tsx
src/services/<feature-name>/
  <feature-name>-service.ts
  <feature-name>-mappers.ts
src/hooks/use-<feature-name>.ts
src/types/<feature-name>.ts
tests/unit/<feature-name>-mappers.test.ts
tests/integration/<feature-name>-service.test.ts
```

Use the smallest useful decomposition: page, sections, components, then
focused primitives. Put each design section in its own file when it has its own
layout, data, animation, or state boundary. Keep shared primitives in a
documented shared location only after a second feature needs them.

## Error contract

Every new endpoint must document and test:

- loading and cancellation behavior;
- empty result behavior;
- malformed success payload behavior;
- timeout, network, parse, and serialization failures;
- 401 session behavior;
- 403 permission behavior;
- 404/not-found behavior;
- 409/conflict behavior when applicable;
- 422 validation mapping when applicable;
- 429 rate-limit behavior; and
- 5xx retry or retry-message behavior.

Use `AppError` and safe user messages. Never expose raw response bodies,
request bodies, authorization headers, access tokens, payment data, or server
stack traces. Never log an error merely to make it disappear; either surface a
safe state or document the intentional non-blocking handling.

## Porting rules

- Do not copy Axios, Redux, localStorage, React Router, browser APIs, callback
  APIs, or web-only layout code from the reference.
- Do not add every reference endpoint speculatively. Port the endpoint with its
  feature and keep the registry honest about what is implemented.
- Do not weaken runtime validation because the reference assumes a response
  shape. Mobile network responses are untrusted input.
- Do not store profile, payment, or product payloads in SecureStore. Only the
  reviewed auth session contract belongs there.
- Do not add a cache, retry library, global store, or navigation abstraction
  without a concrete feature requirement and documented decision.
- Preserve endpoint paths and request semantics unless the backend contract
  explicitly changes; document every intentional mobile difference.
