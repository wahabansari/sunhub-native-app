# Cart and checkout

Guests and signed-in buyers can fill a cart and check out. The behaviour was read from the web
reference (`sunhub3.0`: `api/cart`, `store/actions` cart actions, `shop/cart`, `shop/checkout`) and
re-implemented for mobile; nothing was copied. The cart endpoints and payloads below were also
verified against the QAS API.

## Who owns the cart

| Buyer     | Cart owner                                            |
| --------- | ----------------------------------------------------- |
| Signed in | The account: bearer token, `owner_id: ""`.            |
| Guest     | A random UUID in SecureStore (`cart.guest-owner.v1`). |

The cart lives on the server; the app caches it with React Query under `['cart', 'guest' | 'account']`.
A device that never added anything has no guest id and makes no cart request.

When a guest signs in, `CartSync` calls `mergeGuestCart`: each guest item is added to the account cart
(`account qty + guest qty`, clamped to stock and minimum order), and the guest cart is emptied only if
every item moved. The web app overwrote quantities instead of adding them.

## Endpoints

| Action                | Call                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------- |
| Read cart             | `POST /client/cart/search` `{ fields, with, owner_id }`                                                         |
| Add / set quantity    | `POST /client/cart` `{ item_uuid, qty, owner_id }`. `qty` is the new total, not an increment.                   |
| Delivery choice       | `POST /client/cart` plus `shiping_type` (`FREE_SHIPPING`, `LOCAL_PICKUP`, `ESTIMATED_SHIPPING`, `FEDEX_GROUND`) |
| Remove / clear        | `DELETE /client/cart/:uuid/delete`, `DELETE /client/cart/_delete` (`?owner_id=` for guests)                     |
| FedEx quote           | `POST /client/fedex/rate`                                                                                       |
| Shipping, tax, total  | `GET /client/shipping/price?product_total&is_tax&city&state&country&zip&street&owner_id&fedex_charges`          |
| Place order (guest)   | `POST /client/checkout` with `payment_type: "card"`, `card_token`, `shipping_type: "new"`                       |
| Place order (account) | `POST /client/checkout` with `payment_type: "profile"`, `payment_profile_id`, `shipping_address_id`             |
| Saved data            | `GET/POST /client/my-profile/addresses`, `GET/POST /client/my-profile/payment-profiles`                         |

Required guest checkout fields (taken from the API's validation errors): `customer_name`,
`customer_email`, `payment_type`, `shipping_type`, `last_4`, `expiration_date`, `billing_first_name`,
`billing_last_name`, `name_on_card`, `billing_address`, `billing_zip`, `shipping_address`,
`shipping_state`, `shipping_zip`, `shipping_country`. The web app also sends a hard-coded
`customer_company`; the mobile app does not, because the API does not require it.

## Screens

`/cart`, `/checkout` (guest or signed-in form, chosen from the session) and `/order-confirmation`.
Add buttons on cards, the home Buy direct slider and the product page add to the cart for everyone;
the header cart button shows the item count.

## Pricing and security rules

- **The server prices the order.** `shipping/price` calculates from the `product_total` it is sent, so
  that number is always the sum of the server cart's own unit prices, never user input. Shipping,
  tax, fee and total on screen are exactly what the server returned.
- **Total check before charging.** `usePlaceOrder` recalculates the total on the server first and
  stops, with a notice, if it differs from the one shown.
- **Delivery choices are saved to the cart** (`shiping_type`) before totals are calculated or the order
  is placed, because the server prices shipping from the stored row.
- **Cards never enter JavaScript.** Stripe's native `CardField` holds the number, expiry and CVC; the app
  only learns whether the card is complete and receives a single-use token, last four digits and
  expiry. `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` must be a publishable key; the config parser rejects
  `sk_…`/`rk_…` keys because the bundle is public. Without a key, card entry is disabled.
- **Guest details live in memory only.** Unlike the web app (sessionStorage), nothing is persisted; the
  form is gone when the screen closes. The confirmation screen's order summary is removed from the
  query cache when it closes.
- **Screens that show card or personal details block screenshots and screen recording**
  (`expo-screen-capture`).
- **No logging of sensitive data.** The API client logs paths without query strings (which carry
  addresses and the guest cart id); the cart and checkout code logs no payloads.
- **One submission at a time, never retried automatically.** If the connection drops mid-order, the app
  checks whether the server emptied the cart; if not, it tells the buyer to look for a confirmation
  email before retrying, so a card is not charged twice.
- **Server error text** is shown only for 4xx responses, trimmed and length-limited.
- **Guest cart id** is a capability: it is never logged, displayed or put in a route. It travels in
  the cart API's query string as the API requires.

## Not included

Editing or deleting saved addresses and cards, address autocomplete, coupons/promotions, wishlist and
purchase history. Add them as separate, reviewed changes.
