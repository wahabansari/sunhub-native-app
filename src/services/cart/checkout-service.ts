import { API_ENDPOINTS } from '@/constants/api';
import { AppError, isAppError } from '@/errors/app-error';
import type { ApiClient, ApiRequestOptions } from '@/services/api/api-client';
import { isRecord, numberValue, recordFrom } from '@/services/catalog/catalog-normalizers';
import type { SessionStorage } from '@/services/storage/session-storage';
import type {
  FedexRate,
  GuestContact,
  OrderTotals,
  PlacedOrder,
  SavedAddress,
  SavedCard,
  ShippingAddress,
} from '@/types/cart';

import { parseFedexRates, parseTotals } from './cart-mappers';
import type { GuestOwnerStore } from './guest-owner';
import { parseSavedAddresses, parseSavedCards } from './profile-mappers';

/** A card as Stripe tokenised it: the token and display fields, never the card number. */
export interface CardToken {
  id: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface BillingAddress extends ShippingAddress {
  /** Name on the card. */
  holder: string;
}

export interface CheckoutService {
  /** Server-calculated shipping, tax, fee and total. `productTotal` must come from the server cart. */
  calculateTotals(input: {
    productTotal: number;
    address?: ShippingAddress;
    fedexCharges?: number;
  }): Promise<OrderTotals>;
  fedexRates(address: ShippingAddress, items: Record<string, number>): Promise<FedexRate[]>;
  listAddresses(): Promise<SavedAddress[]>;
  addAddress(
    input: ShippingAddress & { name: string; phone: string; email: string },
  ): Promise<void>;
  listCards(): Promise<SavedCard[]>;
  addCard(token: CardToken, billing: BillingAddress): Promise<void>;
  placeGuestOrder(input: {
    contact: GuestContact;
    shipping: ShippingAddress;
    billing: BillingAddress;
    card: CardToken;
  }): Promise<PlacedOrder>;
  placeSavedOrder(input: {
    addressId: string;
    cardId: string;
    phone: string;
  }): Promise<PlacedOrder>;
}

export interface CheckoutServiceDependencies {
  api: ApiClient;
  session: SessionStorage;
  guest: GuestOwnerStore;
}

const COUNTRY = 'US';

function failure(message: string, fallback: string, error?: AppError): AppError {
  return new AppError('CHECKOUT_FAILED', message, {
    status: error?.status,
    userMessage: error?.serverMessages[0] ?? fallback,
    serverMessages: error?.serverMessages,
    fieldErrors: error?.fieldErrors,
  });
}

function formatExpiry(month: number, year: number): string {
  return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
}

function readOrder(payload: unknown, email?: string): PlacedOrder {
  const data = isRecord(payload) ? recordFrom(payload.data) : {};
  const money = (value: unknown) => (value === undefined ? undefined : numberValue(value));

  return {
    total: money(data.total_amount),
    tax: money(data.total_tax_amount),
    shipping: money(data.shipping_cost),
    email,
  };
}

export function createCheckoutService({
  api,
  session,
  guest,
}: CheckoutServiceDependencies): CheckoutService {
  async function token(): Promise<string> {
    const stored = await session.read();
    if (!stored) {
      throw new AppError('AUTH_INVALID_SESSION', 'No session', {
        userMessage: 'Please sign in to continue.',
      });
    }
    return stored.accessToken;
  }

  async function send<T>(options: ApiRequestOptions, fallback: string): Promise<T> {
    try {
      return await api.request<T>(options);
    } catch (error) {
      if (isAppError(error) && error.status !== undefined && error.status < 500) {
        throw failure('Checkout request was rejected', fallback, error);
      }
      throw error;
    }
  }

  function assertAccepted(payload: unknown, fallback: string): void {
    const status = isRecord(payload) ? payload.status : undefined;
    if (status === 0 || status === false)
      throw failure('Request returned a failure status', fallback);
  }

  return {
    async calculateTotals({ productTotal, address, fedexCharges }) {
      if (!Number.isFinite(productTotal) || productTotal < 0) {
        throw failure('Invalid product total', 'Your cart total could not be calculated.');
      }
      const stored = await session.read();
      const params = new URLSearchParams({
        product_total: productTotal.toFixed(2),
        is_tax: address ? '1' : '0',
        owner_id: stored ? '' : await guest.getOrCreate(),
      });
      if (address) {
        params.set('city', address.city);
        params.set('state', address.state);
        params.set('country', COUNTRY);
        params.set('zip', address.zip);
        params.set('street', address.address);
        params.set('fedex_charges', fedexCharges ? fedexCharges.toFixed(2) : '');
      }

      const payload = await send<unknown>(
        {
          path: `${API_ENDPOINTS.commerce.shippingPrice}?${params.toString()}`,
          token: stored?.accessToken,
        },
        'We could not calculate your total. Please try again.',
      );
      const totals = parseTotals(payload);
      if (!totals)
        throw failure('Unreadable totals', 'We could not calculate your total. Please try again.');
      return totals;
    },

    async fedexRates(address, items) {
      const payload = await send<unknown>(
        {
          method: 'POST',
          path: API_ENDPOINTS.commerce.fedexRate,
          body: {
            shipping_address: address.address,
            shipping_city: address.city.toLowerCase(),
            shipping_state: address.state,
            shipping_zip: address.zip,
            items,
            shipping_type: 'fedex',
          },
        },
        'Please provide a valid shipping address.',
      );
      assertAccepted(payload, 'Please provide a valid shipping address.');
      return parseFedexRates(payload);
    },

    async listAddresses() {
      const payload = await send<unknown>(
        { path: API_ENDPOINTS.account.addAddress, token: await token() },
        'Your saved addresses could not be loaded.',
      );
      return parseSavedAddresses(payload);
    },

    async addAddress({ name, phone, email, address, city, state, zip }) {
      const payload = await send<unknown>(
        {
          method: 'POST',
          path: API_ENDPOINTS.account.addAddress,
          token: await token(),
          body: {
            name,
            email,
            number: phone.replace(/\D/g, ''),
            address1: address,
            city,
            state,
            zip,
            default: '1',
            country: COUNTRY,
          },
        },
        'That address could not be saved.',
      );
      assertAccepted(payload, 'That address could not be saved.');
    },

    async listCards() {
      const payload = await send<unknown>(
        { path: API_ENDPOINTS.account.paymentProfiles, token: await token() },
        'Your saved cards could not be loaded.',
      );
      return parseSavedCards(payload);
    },

    async addCard(card, billing) {
      const payload = await send<unknown>(
        {
          method: 'POST',
          path: API_ENDPOINTS.account.paymentProfiles,
          token: await token(),
          body: {
            type: 'card',
            account_type: 'personal',
            token: card.id,
            last_4: card.last4,
            expiration_date: formatExpiry(card.expMonth, card.expYear),
            name: billing.holder,
            billing_address: billing.address,
            billing_city: billing.city,
            billing_state: billing.state,
            billing_zip: billing.zip,
            country: COUNTRY,
          },
        },
        'That card could not be saved.',
      );
      assertAccepted(payload, 'That card could not be saved.');
    },

    async placeGuestOrder({ contact, shipping, billing, card }) {
      const fallback = 'Your order could not be placed. You have not been charged.';
      const payload = await send<unknown>(
        {
          method: 'POST',
          path: API_ENDPOINTS.commerce.checkout,
          body: {
            owner_id: await guest.getOrCreate(),
            payment_type: 'card',
            card_token: card.id,
            last_4: card.last4,
            expiration_date: formatExpiry(card.expMonth, card.expYear),
            save_payment_method: 0,
            customer_name: `${contact.firstName} ${contact.lastName}`.trim(),
            customer_email: contact.email,
            customer_phone: contact.phone.replace(/\D/g, ''),
            billing_first_name: contact.firstName,
            billing_last_name: contact.lastName,
            name_on_card: billing.holder,
            billing_address: billing.address,
            billing_city: billing.city,
            billing_state: billing.state,
            billing_zip: billing.zip,
            billing_country: COUNTRY,
            shipping_type: 'new',
            shipping_address: shipping.address,
            shipping_city: shipping.city,
            shipping_state: shipping.state,
            shipping_zip: shipping.zip,
            shipping_country: COUNTRY,
          },
        },
        fallback,
      );
      assertAccepted(payload, fallback);
      return readOrder(payload, contact.email);
    },

    async placeSavedOrder({ addressId, cardId, phone }) {
      const fallback = 'Your order could not be placed. You have not been charged.';
      const payload = await send<unknown>(
        {
          method: 'POST',
          path: API_ENDPOINTS.commerce.checkout,
          token: await token(),
          body: {
            payment_type: 'profile',
            payment_profile_id: cardId,
            shipping_type: 'saved',
            shipping_address_id: addressId,
            customer_phone: phone.replace(/\D/g, ''),
          },
        },
        fallback,
      );
      assertAccepted(payload, fallback);
      return readOrder(payload);
    },
  };
}
