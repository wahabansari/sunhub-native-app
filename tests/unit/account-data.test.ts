import { describe, expect, it, vi } from 'vitest';

import { formatDate } from '@/utils/dates';
import { roleLabel } from '@/utils/roles';

process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';

const { normalizeListings, normalizeOrders, normalizeSoldItems } =
  await import('@/services/account/account-mappers');
const { createAccountDataService } = await import('@/services/account/account-data-service');
const { AppError } = await import('@/errors/app-error');

function setup(token: string | null = 'tok') {
  const request = vi.fn();
  const service = createAccountDataService({
    api: { request } as never,
    session: {
      read: vi.fn().mockResolvedValue(token ? { accessToken: token, roles: [] } : null),
      write: vi.fn(),
      clear: vi.fn(),
    },
  });
  return { service, request };
}

describe('account mappers', () => {
  it('reads orders with their lines and the pagination', () => {
    const page = normalizeOrders({
      data: [
        {
          id: 7,
          order_number: 'SH-100',
          created_at: '2026-11-11T10:00:00Z',
          status: 'shipped',
          total_amount: 120.5,
          total_tax_amount: 5,
          shipping_cost_estimated: 10,
          order_items: [
            { qty: 2, item: { name: 'Panel' } },
            { quantity: 1, name: 'Inverter' },
          ],
        },
        'junk',
      ],
      pagination: { total: 21, current_page: 1, last_page: 2 },
    });

    expect(page).toMatchObject({ total: 21, page: 1, hasMore: true });
    expect(page.items).toEqual([
      {
        id: '7',
        number: 'SH-100',
        date: '2026-11-11T10:00:00Z',
        status: 'shipped',
        total: 120.5,
        shipping: 10,
        tax: 5,
        lines: [
          { name: 'Panel', qty: 2 },
          { name: 'Inverter', qty: 1 },
        ],
      },
    ]);
  });

  it('reads seller listings and drops rows without an id', () => {
    const page = normalizeListings({
      data: [
        { uuid: 'A1', name: 'Panel', price: '10.5', total_qty: 4, um: 'pallet', is_active: 0 },
        { uuid: '', name: 'No id' },
      ],
    });

    expect(page.items).toEqual([
      {
        uuid: 'A1',
        name: 'Panel',
        price: 10.5,
        stock: 4,
        unit: 'pallet',
        isActive: false,
        status: '',
        imageUrl: undefined,
      },
    ]);
  });

  it('reads sold items and tolerates an empty response', () => {
    expect(
      normalizeSoldItems({
        data: [{ order_id: 55, customer_name: 'Jo', total_amount: 90, shipping_cost: 4 }],
      }).items[0],
    ).toMatchObject({ id: '55', customer: 'Jo', total: 90, shipping: 4 });
    expect(normalizeSoldItems(undefined)).toMatchObject({ items: [], total: 0, hasMore: false });
  });
});

describe('account data service', () => {
  it('requests a page of orders with the bearer token', async () => {
    const { service, request } = setup();
    request.mockResolvedValue({ data: [] });

    await service.listOrders(3);

    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/client/my-profile/purchase-history',
      token: 'tok',
      body: { page: 3, limit: 15, orderby: { created_at: 'DESC' } },
    });
  });

  it('refuses every call without a session', async () => {
    const { service, request } = setup(null);

    await expect(service.listMyListings(1)).rejects.toMatchObject({
      code: 'AUTH_INVALID_SESSION',
    });
    expect(request).not.toHaveBeenCalled();
  });

  it('sends the three password fields and reports a refusal with the server message', async () => {
    const { service, request } = setup();
    request.mockResolvedValueOnce({ status: 1 });
    await service.changePassword({ current: 'old', next: 'new-pass', confirmation: 'new-pass' });
    expect(request.mock.calls[0][0]).toMatchObject({
      path: '/client/my-profile/change-password',
      body: { old_password: 'old', password: 'new-pass', password_confirmation: 'new-pass' },
    });

    request.mockRejectedValueOnce(
      new AppError('HTTP', 'bad', {
        status: 422,
        serverMessages: ['The old password is incorrect.'],
      }),
    );
    await expect(
      service.changePassword({ current: 'x', next: 'y', confirmation: 'y' }),
    ).rejects.toMatchObject({ userMessage: 'The old password is incorrect.' });
  });

  it('keeps a 401 as an expired session instead of hiding it', async () => {
    const { service, request } = setup();
    const expired = new AppError('HTTP', 'expired', { status: 401 });
    request.mockRejectedValue(expired);

    await expect(service.listOrders(1)).rejects.toBe(expired);
  });

  it('deletes by id and rejects ids that are not plain identifiers', async () => {
    const { service, request } = setup();
    request.mockResolvedValue({ status: 1 });

    await service.deleteAddress('12');
    await service.deleteCard('abc-9');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'DELETE',
      path: '/client/my-profile/addresses/12',
    });
    expect(request.mock.calls[1][0].path).toBe('/client/my-profile/payment-profiles/abc-9');

    await expect(service.deleteAddress('../1')).rejects.toMatchObject({
      code: 'ACCOUNT_REQUEST_FAILED',
    });
    expect(request).toHaveBeenCalledTimes(2);
  });
});

describe('role label and dates', () => {
  it('names each role combination', () => {
    expect(roleLabel(['customer'])).toBe('Buyer');
    expect(roleLabel(['seller'])).toBe('Seller');
    expect(roleLabel(['seller', 'customer'])).toBe('Buyer & Seller');
    expect(roleLabel([])).toBe('Member');
  });

  it('formats ISO dates and ignores bad ones', () => {
    expect(formatDate('2026-11-11T12:00:00Z')).toMatch(/Nov 1[01], 2026/);
    expect(formatDate('not a date')).toBe('');
    expect(formatDate(undefined)).toBe('');
  });
});
