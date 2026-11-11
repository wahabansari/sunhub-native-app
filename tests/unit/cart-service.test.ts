import { describe, expect, it, vi } from 'vitest';

process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';

const { createCartService } = await import('@/services/cart/cart-service');
const { AppError } = await import('@/errors/app-error');

const GUEST_ID = '11111111-2222-4333-8444-555555555555';
const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };

function setup({ token, guestId = GUEST_ID }: { token?: string; guestId?: string | null } = {}) {
  const request = vi.fn();
  const guest = {
    peek: vi.fn().mockResolvedValue(guestId),
    getOrCreate: vi.fn().mockResolvedValue(guestId ?? GUEST_ID),
    clear: vi.fn(),
  };
  const session = {
    read: vi.fn().mockResolvedValue(token ? { accessToken: token, roles: [] } : null),
    write: vi.fn(),
    clear: vi.fn(),
  };
  const service = createCartService({
    api: { request } as never,
    session,
    guest,
    logger,
  });
  return { service, request, guest };
}

const cartRows = (rows: { uuid: string; qty: number; moq?: number; stock?: number }[]) => ({
  status: 1,
  data: rows.map((entry) => ({
    item_uuid: entry.uuid,
    qty: entry.qty,
    item: {
      uuid: entry.uuid,
      name: entry.uuid,
      price: '10',
      moq: entry.moq ?? 1,
      total_qty: entry.stock ?? 100,
      shipping_type: 'free_shipping',
    },
  })),
});

describe('cart owner', () => {
  it('skips the request for a device that never had a guest cart', async () => {
    const { service, request } = setup({ guestId: null });

    await expect(service.getCart()).resolves.toMatchObject({ items: [], itemCount: 0 });
    expect(request).not.toHaveBeenCalled();
  });

  it('reads a guest cart with the guest id and no token', async () => {
    const { service, request } = setup();
    request.mockResolvedValue(cartRows([{ uuid: 'A', qty: 1 }]));

    await service.getCart();

    expect(request.mock.calls[0][0]).toMatchObject({
      path: '/client/cart/search',
      token: undefined,
      body: { owner_id: GUEST_ID },
    });
  });

  it('reads the account cart with the token and an empty owner id', async () => {
    const { service, request } = setup({ token: 'secret-token' });
    request.mockResolvedValue(cartRows([]));

    await service.getCart();

    expect(request.mock.calls[0][0]).toMatchObject({
      token: 'secret-token',
      body: { owner_id: '' },
    });
  });
});

describe('cart changes', () => {
  it('adds on top of the quantity already in the cart, within stock', async () => {
    const { service, request } = setup();
    request
      .mockResolvedValueOnce(cartRows([{ uuid: 'A', qty: 4 }]))
      .mockResolvedValueOnce({ status: 1 });

    await service.addItem('A', 10, { moq: 1, stock: 8 });

    expect(request.mock.calls[1][0]).toMatchObject({
      path: '/client/cart',
      body: { item_uuid: 'A', qty: 8, owner_id: GUEST_ID },
    });
  });

  it('rejects product ids that are not plain identifiers', async () => {
    const { service, request } = setup();

    await expect(service.setQuantity('../x', 1)).rejects.toMatchObject({
      code: 'CART_REQUEST_FAILED',
    });
    expect(request).not.toHaveBeenCalled();
  });

  it('treats a status 0 response as a failure with a safe message', async () => {
    const { service, request } = setup();
    request.mockResolvedValue({ status: 0 });

    await expect(service.setQuantity('A', 2)).rejects.toMatchObject({
      userMessage: 'That item could not be added to your cart.',
    });
  });

  it('removes one item and clears the cart with the owner id in the query', async () => {
    const { service, request } = setup();
    request.mockResolvedValue({ status: 1 });

    await service.removeItem('A');
    await service.clear();

    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'DELETE',
      path: `/client/cart/A/delete?owner_id=${GUEST_ID}`,
    });
    expect(request.mock.calls[1][0].path).toBe(`/client/cart/_delete?owner_id=${GUEST_ID}`);
  });

  it('turns a rejected 4xx into a cart error carrying the server message', async () => {
    const { service, request } = setup();
    request.mockRejectedValue(
      new AppError('HTTP', 'bad', { status: 422, serverMessages: ['Not enough stock'] }),
    );

    await expect(service.setQuantity('A', 2)).rejects.toMatchObject({
      code: 'CART_REQUEST_FAILED',
      userMessage: 'Not enough stock',
    });
  });
});

describe('guest cart merge', () => {
  it('adds guest quantities onto the account cart and then empties the guest cart', async () => {
    const { service, request } = setup({ token: 'tok' });
    request
      .mockResolvedValueOnce(
        cartRows([
          { uuid: 'A', qty: 2 },
          { uuid: 'B', qty: 1 },
        ]),
      ) // guest cart
      .mockResolvedValueOnce(cartRows([{ uuid: 'A', qty: 3 }])) // account cart
      .mockResolvedValue({ status: 1 });

    await service.mergeGuestCart();

    const posts = request.mock.calls.filter(
      ([options]) => options.method === 'POST' && options.path === '/client/cart',
    );
    expect(posts.map(([options]) => options.body)).toEqual([
      { item_uuid: 'A', qty: 5, owner_id: '' },
      { item_uuid: 'B', qty: 1, owner_id: '' },
    ]);
    expect(posts.every(([options]) => options.token === 'tok')).toBe(true);
    expect(request.mock.calls.at(-1)?.[0]).toMatchObject({
      method: 'DELETE',
      path: `/client/cart/_delete?owner_id=${GUEST_ID}`,
    });
  });

  it('keeps the guest cart when any item fails to move', async () => {
    const { service, request } = setup({ token: 'tok' });
    request
      .mockResolvedValueOnce(cartRows([{ uuid: 'A', qty: 2 }]))
      .mockResolvedValueOnce(cartRows([]))
      .mockResolvedValueOnce({ status: 0 });

    await service.mergeGuestCart();

    expect(request.mock.calls.some(([options]) => options.method === 'DELETE')).toBe(false);
  });

  it('does nothing for guests or when no guest cart exists', async () => {
    const guestOnly = setup();
    await guestOnly.service.mergeGuestCart();
    expect(guestOnly.request).not.toHaveBeenCalled();

    const noGuestCart = setup({ token: 'tok', guestId: null });
    await noGuestCart.service.mergeGuestCart();
    expect(noGuestCart.request).not.toHaveBeenCalled();
  });
});
