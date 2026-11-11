import { describe, expect, it, vi } from 'vitest';

process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';

const { createCheckoutService } = await import('@/services/cart/checkout-service');
const { parseSavedAddresses, parseSavedCards } = await import('@/services/cart/profile-mappers');
const { AppError } = await import('@/errors/app-error');

const GUEST_ID = '11111111-2222-4333-8444-555555555555';

function setup(token?: string) {
  const request = vi.fn();
  const service = createCheckoutService({
    api: { request } as never,
    session: {
      read: vi.fn().mockResolvedValue(token ? { accessToken: token, roles: [] } : null),
      write: vi.fn(),
      clear: vi.fn(),
    },
    guest: { peek: vi.fn(), getOrCreate: vi.fn().mockResolvedValue(GUEST_ID), clear: vi.fn() },
  });
  return { service, request };
}

const address = { address: '100 Congress Ave', city: 'Austin', state: 'TX', zip: '78701' };
const card = { id: 'tok_123', last4: '4242', expMonth: 4, expYear: 2031 };

describe('order totals', () => {
  it('asks the server to price the cart for this address and parses its answer', async () => {
    const { service, request } = setup();
    request.mockResolvedValue({
      data: { shipping_cost: 11.4, tax: 5, strip_fee: 1, total: 367.4 },
    });

    const totals = await service.calculateTotals({ productTotal: 350, address, fedexCharges: 0 });

    expect(totals).toEqual({ shipping: 11.4, tax: 5, processingFee: 1, total: 367.4 });
    const path: string = request.mock.calls[0][0].path;
    expect(path).toContain('product_total=350.00');
    expect(path).toContain('is_tax=1');
    expect(path).toContain('street=100+Congress+Ave');
    expect(path).toContain(`owner_id=${GUEST_ID}`);
  });

  it('prices without tax before an address exists and sends no guest id when signed in', async () => {
    const { service, request } = setup('tok');
    request.mockResolvedValue({ data: { total: 10 } });

    await service.calculateTotals({ productTotal: 5 });

    const call = request.mock.calls[0][0];
    expect(call.path).toContain('is_tax=0');
    expect(call.path).toContain('owner_id=');
    expect(call.path).not.toContain(GUEST_ID);
    expect(call.token).toBe('tok');
  });

  it('refuses a nonsensical product total and an unreadable answer', async () => {
    const { service, request } = setup();

    await expect(service.calculateTotals({ productTotal: Number.NaN })).rejects.toMatchObject({
      code: 'CHECKOUT_FAILED',
    });
    request.mockResolvedValue({ data: {} });
    await expect(service.calculateTotals({ productTotal: 5 })).rejects.toMatchObject({
      code: 'CHECKOUT_FAILED',
    });
  });
});

describe('placing orders', () => {
  const contact = {
    firstName: 'Jo',
    lastName: 'Solar',
    email: 'jo@example.com',
    phone: '(555) 123-4567',
  };

  it('sends a guest order with the Stripe token and never any card number', async () => {
    const { service, request } = setup();
    request.mockResolvedValue({
      status: 1,
      data: { total_amount: 367.4, total_tax_amount: 5, shipping_cost: 11.4 },
    });

    const order = await service.placeGuestOrder({
      contact,
      shipping: address,
      billing: { ...address, holder: 'Jo Solar' },
      card,
    });

    const body = request.mock.calls[0][0].body;
    expect(body).toMatchObject({
      owner_id: GUEST_ID,
      payment_type: 'card',
      card_token: 'tok_123',
      last_4: '4242',
      expiration_date: '04/31',
      customer_email: 'jo@example.com',
      customer_phone: '5551234567',
      shipping_type: 'new',
      shipping_state: 'TX',
      billing_zip: '78701',
      save_payment_method: 0,
    });
    expect(Object.keys(body).some((key) => /number|cvc|cvv|pan/i.test(key))).toBe(false);
    expect(request.mock.calls[0][0].token).toBeUndefined();
    expect(order).toEqual({ total: 367.4, tax: 5, shipping: 11.4, email: 'jo@example.com' });
  });

  it('sends a signed-in order by profile ids with the bearer token', async () => {
    const { service, request } = setup('tok');
    request.mockResolvedValue({ status: 1, data: { total_amount: 10 } });

    await service.placeSavedOrder({ addressId: '7', cardId: '9', phone: '(555) 123-4567' });

    expect(request.mock.calls[0][0]).toMatchObject({
      token: 'tok',
      body: {
        payment_type: 'profile',
        payment_profile_id: '9',
        shipping_type: 'saved',
        shipping_address_id: '7',
        customer_phone: '5551234567',
      },
    });
  });

  it('requires a session for saved-profile calls', async () => {
    const { service } = setup();

    await expect(
      service.placeSavedOrder({ addressId: '1', cardId: '2', phone: '5' }),
    ).rejects.toMatchObject({
      code: 'AUTH_INVALID_SESSION',
    });
    await expect(service.listCards()).rejects.toMatchObject({ code: 'AUTH_INVALID_SESSION' });
  });

  it('reports a rejected order with the server message and leaves network errors untouched', async () => {
    const { service, request } = setup();
    request.mockRejectedValueOnce(
      new AppError('HTTP', 'declined', {
        status: 400,
        serverMessages: ['Your card was declined.'],
      }),
    );
    await expect(
      service.placeGuestOrder({
        contact,
        shipping: address,
        billing: { ...address, holder: 'Jo' },
        card,
      }),
    ).rejects.toMatchObject({ code: 'CHECKOUT_FAILED', userMessage: 'Your card was declined.' });

    const network = new AppError('NETWORK', 'offline');
    request.mockRejectedValueOnce(network);
    await expect(
      service.placeGuestOrder({
        contact,
        shipping: address,
        billing: { ...address, holder: 'Jo' },
        card,
      }),
    ).rejects.toBe(network);
  });

  it('treats a status 0 body as a failed order', async () => {
    const { service, request } = setup('tok');
    request.mockResolvedValue({ status: 0 });

    await expect(
      service.placeSavedOrder({ addressId: '1', cardId: '2', phone: '5' }),
    ).rejects.toMatchObject({
      userMessage: 'Your order could not be placed. You have not been charged.',
    });
  });
});

describe('saved profile parsing', () => {
  it('keeps usable addresses and cards and drops the rest', () => {
    expect(
      parseSavedAddresses({
        data: [
          {
            id: 3,
            name: 'Home',
            address1: '1 Main St',
            city: 'Austin',
            state: 'tx',
            zip: '78701',
            number: '5551234567',
          },
          { id: 4, address1: '' },
          'junk',
        ],
      }),
    ).toEqual([
      {
        id: '3',
        name: 'Home',
        address: '1 Main St',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        phone: '5551234567',
      },
    ]);

    expect(
      parseSavedCards({
        data: [
          {
            id: 8,
            brand: 'Visa',
            last_4: '4242',
            expiration_date: '04/31',
            billing_first_name: 'Jo',
            billing_last_name: 'S',
            billing_address: '1 Main',
            billing_city: 'Austin',
            billing_state: 'TX',
            billing_zip: '78701',
          },
          { id: 9, last_4: '' },
        ],
      }),
    ).toEqual([
      {
        id: '8',
        brand: 'Visa',
        last4: '4242',
        expiration: '04/31',
        holder: 'Jo S',
        billingSummary: '1 Main, Austin, TX, 78701',
      },
    ]);
  });
});
