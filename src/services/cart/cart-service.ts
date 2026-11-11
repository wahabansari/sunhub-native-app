import { API_ENDPOINTS } from '@/constants/api';
import { AppError, isAppError } from '@/errors/app-error';
import type { ApiClient } from '@/services/api/api-client';
import type { Logger } from '@/services/logging/logger';
import type { SessionStorage } from '@/services/storage/session-storage';
import type { Cart } from '@/types/cart';

import { normalizeCart, clampQuantity } from './cart-mappers';
import type { GuestOwnerStore } from './guest-owner';

const CART_FIELDS = [
  'id',
  'item_uuid',
  'qty',
  'price',
  'shipping_type',
  'total_qty',
  'discount',
  'scalling_price',
  'shipping_cost',
  'user_name',
  'extra_handling',
];
const CART_RELATIONS = [
  'item',
  'item.category',
  'item.brand',
  'item.bulk_savings',
  'item.images',
  'item.owner',
];
const EMPTY_CART: Cart = { items: [], subtotal: 0, itemCount: 0, hasOutOfStock: false };
const PRODUCT_UUID = /^[A-Za-z0-9_-]{1,40}$/;

export interface CartService {
  getCart(): Promise<Cart>;
  /** Sets (not adds to) the quantity of one item, adding it when it is not in the cart yet. */
  setQuantity(uuid: string, qty: number): Promise<void>;
  /** Adds `qty` on top of what the cart already holds, respecting the minimum order and stock. */
  addItem(uuid: string, qty: number, limits: { moq: number; stock: number }): Promise<void>;
  setShipping(uuid: string, qty: number, shippingType: string): Promise<void>;
  removeItem(uuid: string): Promise<void>;
  clear(): Promise<void>;
  /** After sign-in: moves the guest cart into the account cart without losing or overwriting items. */
  mergeGuestCart(): Promise<void>;
}

export interface CartServiceDependencies {
  api: ApiClient;
  session: SessionStorage;
  guest: GuestOwnerStore;
  logger: Logger;
}

type Owner = { token?: string; ownerId: string };

function cartError(message: string, userMessage: string, status?: number): AppError {
  return new AppError('CART_REQUEST_FAILED', message, { status, userMessage });
}

export function createCartService({
  api,
  session,
  guest,
  logger,
}: CartServiceDependencies): CartService {
  /** Signed-in buyers use their token and an empty owner id; guests use the device's guest id. */
  async function resolveOwner(): Promise<Owner> {
    const stored = await session.read();
    if (stored) return { token: stored.accessToken, ownerId: '' };
    return { ownerId: await guest.getOrCreate() };
  }

  function assertUuid(uuid: string): void {
    if (!PRODUCT_UUID.test(uuid))
      throw cartError('Invalid product id', 'That product is not available.');
  }

  async function call<T>(options: Parameters<ApiClient['request']>[0]): Promise<T> {
    try {
      return await api.request<T>(options);
    } catch (error) {
      if (isAppError(error) && error.status !== undefined && error.status < 500) {
        throw new AppError('CART_REQUEST_FAILED', 'Cart request was rejected', {
          status: error.status,
          userMessage:
            error.serverMessages[0] ?? 'Your cart could not be updated. Please try again.',
          serverMessages: error.serverMessages,
        });
      }
      throw error;
    }
  }

  function ensureAccepted(payload: unknown, fallback: string): void {
    const status = (payload as { status?: unknown } | undefined)?.status;
    if (status === 0 || status === false) {
      throw cartError('Cart request returned a failure status', fallback);
    }
  }

  const ownerQuery = (owner: Owner) =>
    owner.ownerId ? `?owner_id=${encodeURIComponent(owner.ownerId)}` : '';

  async function fetchCartFor(owner: Owner) {
    return call<unknown>({
      method: 'POST',
      path: API_ENDPOINTS.commerce.cart,
      body: { fields: CART_FIELDS, with: CART_RELATIONS, owner_id: owner.ownerId },
      token: owner.token,
    });
  }

  async function postItem(owner: Owner, body: Record<string, unknown>): Promise<void> {
    const payload = await call<unknown>({
      method: 'POST',
      path: API_ENDPOINTS.commerce.addCartItem,
      body: { ...body, owner_id: owner.ownerId },
      token: owner.token,
    });
    ensureAccepted(payload, 'That item could not be added to your cart.');
  }

  return {
    async getCart(): Promise<Cart> {
      const stored = await session.read();
      // A device that never added anything has no guest cart; skip the request (and the id).
      const guestId = stored ? null : await guest.peek();
      if (!stored && !guestId) return EMPTY_CART;

      const owner: Owner = stored
        ? { token: stored.accessToken, ownerId: '' }
        : { ownerId: guestId ?? '' };
      return normalizeCart(await fetchCartFor(owner));
    },

    async setQuantity(uuid, qty) {
      assertUuid(uuid);
      await postItem(await resolveOwner(), { item_uuid: uuid, qty: Math.max(1, Math.floor(qty)) });
    },

    async addItem(uuid, qty, limits) {
      assertUuid(uuid);
      const owner = await resolveOwner();
      const current = normalizeCart(await fetchCartFor(owner)).items.find(
        (entry) => entry.uuid === uuid,
      );
      const wanted = clampQuantity((current?.qty ?? 0) + qty, limits.moq, limits.stock);
      await postItem(owner, { item_uuid: uuid, qty: wanted });
    },

    async setShipping(uuid, qty, shippingType) {
      assertUuid(uuid);
      await postItem(await resolveOwner(), {
        item_uuid: uuid,
        qty: Math.max(1, Math.floor(qty)),
        shiping_type: shippingType,
      });
    },

    async removeItem(uuid) {
      assertUuid(uuid);
      const owner = await resolveOwner();
      await call<unknown>({
        method: 'DELETE',
        path: `${API_ENDPOINTS.commerce.removeCartItem.replace(':uuid', encodeURIComponent(uuid))}${ownerQuery(owner)}`,
        token: owner.token,
      });
    },

    async clear() {
      const owner = await resolveOwner();
      await call<unknown>({
        method: 'DELETE',
        path: `${API_ENDPOINTS.commerce.clearCart}${ownerQuery(owner)}`,
        token: owner.token,
      });
    },

    async mergeGuestCart() {
      const session_ = await session.read();
      const guestId = await guest.peek();
      if (!session_ || !guestId) return;

      const guestOwner: Owner = { ownerId: guestId };
      const account: Owner = { token: session_.accessToken, ownerId: '' };
      const guestItems = normalizeCart(await fetchCartFor(guestOwner)).items;
      if (!guestItems.length) return;

      const accountItems = normalizeCart(await fetchCartFor(account)).items;
      let failed = false;

      for (const item of guestItems) {
        const existing = accountItems.find((entry) => entry.uuid === item.uuid);
        const qty = clampQuantity((existing?.qty ?? 0) + item.qty, item.moq, item.stock);
        try {
          await postItem(account, { item_uuid: item.uuid, qty });
        } catch {
          failed = true;
        }
      }

      if (failed) {
        // Keep the guest cart so nothing is lost; the next sign-in tries again.
        logger.warn('Some guest cart items could not be moved to the account cart');
        return;
      }
      await call<unknown>({
        method: 'DELETE',
        path: `${API_ENDPOINTS.commerce.clearCart}${ownerQuery(guestOwner)}`,
      });
    },
  };
}
