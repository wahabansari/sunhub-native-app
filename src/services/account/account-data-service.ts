import { API_ENDPOINTS } from '@/constants/api';
import { AppError, isAppError } from '@/errors/app-error';
import type { ApiClient, ApiRequestOptions } from '@/services/api/api-client';
import type { SessionStorage } from '@/services/storage/session-storage';
import type {
  AccountPage,
  OrderSummary,
  PasswordChange,
  SellerListing,
  SoldItem,
} from '@/types/account';

import { normalizeListings, normalizeOrders, normalizeSoldItems } from './account-mappers';

const PAGE_SIZE = 15;
const CHANGE_PASSWORD_PATH = '/client/my-profile/change-password';

const ORDER_FIELDS = [
  'id',
  'order_number',
  'customer_name',
  'created_at',
  'status',
  'total_amount',
  'total_tax_amount',
  'shipping_cost_estimated',
  'uuid',
];
const LISTING_FIELDS = ['uuid', 'name', 'price', 'total_qty', 'um', 'status', 'is_active'];
const SOLD_FIELDS = [
  'order_id',
  'customer_name',
  'created_at',
  'shipping_type',
  'shipping_cost',
  'total_amount',
  'status',
];

export interface AccountDataService {
  listOrders(page: number): Promise<AccountPage<OrderSummary>>;
  listMyListings(page: number): Promise<AccountPage<SellerListing>>;
  listSoldItems(page: number): Promise<AccountPage<SoldItem>>;
  changePassword(input: PasswordChange): Promise<void>;
  deleteAddress(id: string): Promise<void>;
  deleteCard(id: string): Promise<void>;
}

export interface AccountDataServiceDependencies {
  api: ApiClient;
  session: SessionStorage;
}

const ID_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;

export function createAccountDataService({
  api,
  session,
}: AccountDataServiceDependencies): AccountDataService {
  async function send<T>(options: Omit<ApiRequestOptions, 'token'>, fallback: string): Promise<T> {
    const stored = await session.read();
    if (!stored) {
      throw new AppError('AUTH_INVALID_SESSION', 'No session', {
        userMessage: 'Please sign in to continue.',
      });
    }

    try {
      return await api.request<T>({ ...options, token: stored.accessToken });
    } catch (error) {
      if (isAppError(error) && error.status !== undefined && error.status < 500) {
        if (error.status === 401) throw error;
        throw new AppError('ACCOUNT_REQUEST_FAILED', 'Account request was rejected', {
          status: error.status,
          userMessage: error.serverMessages[0] ?? fallback,
          serverMessages: error.serverMessages,
          fieldErrors: error.fieldErrors,
        });
      }
      throw error;
    }
  }

  const search = (path: string, fields: string[], page: number, extra: object = {}) =>
    send<unknown>(
      { method: 'POST', path, body: { fields, limit: PAGE_SIZE, page, ...extra } },
      'We could not load this list. Please try again.',
    );

  function assertId(id: string): void {
    if (!ID_PATTERN.test(id)) {
      throw new AppError('ACCOUNT_REQUEST_FAILED', 'Invalid id', {
        userMessage: 'That item could not be found.',
      });
    }
  }

  return {
    async listOrders(page) {
      return normalizeOrders(
        await search(API_ENDPOINTS.account.purchaseHistory, ORDER_FIELDS, page, {
          with: ['order_items', 'order_items.item'],
          orderby: { created_at: 'DESC' },
        }),
      );
    },

    async listMyListings(page) {
      return normalizeListings(
        await search(API_ENDPOINTS.catalog.sellerProducts, LISTING_FIELDS, page, {
          with: ['images'],
        }),
      );
    },

    async listSoldItems(page) {
      return normalizeSoldItems(
        await search(API_ENDPOINTS.commerce.buyingHistory, SOLD_FIELDS, page),
      );
    },

    async changePassword({ current, next, confirmation }) {
      const fallback = 'Your password could not be changed. Check your current password.';
      const payload = await send<{ status?: unknown }>(
        {
          method: 'POST',
          path: CHANGE_PASSWORD_PATH,
          body: { old_password: current, password: next, password_confirmation: confirmation },
        },
        fallback,
      );
      if (payload?.status === 0 || payload?.status === false) {
        throw new AppError('ACCOUNT_REQUEST_FAILED', 'Password change rejected', {
          userMessage: fallback,
        });
      }
    },

    async deleteAddress(id) {
      assertId(id);
      await send(
        { method: 'DELETE', path: API_ENDPOINTS.account.updateAddress.replace(':id', id) },
        'That address could not be removed.',
      );
    },

    async deleteCard(id) {
      assertId(id);
      await send(
        { method: 'DELETE', path: API_ENDPOINTS.account.paymentProfile.replace(':id', id) },
        'That card could not be removed.',
      );
    },
  };
}
