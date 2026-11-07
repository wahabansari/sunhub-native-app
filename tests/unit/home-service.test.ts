import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';

const mocks = vi.hoisted(() => ({
  mainRequest: vi.fn(),
  brokerRequest: vi.fn(),
}));

vi.mock('@/services/api', () => ({
  apiClient: { request: mocks.mainRequest },
  brokerApiClient: { request: mocks.brokerRequest },
}));

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

const { loadHomeData } = await import('@/services/home/home-service');

describe('loadHomeData', () => {
  beforeEach(() => {
    mocks.mainRequest.mockReset();
    mocks.brokerRequest.mockReset();
    mocks.mainRequest.mockImplementation(({ path }: { path: string }) => {
      if (path.includes('categories'))
        return Promise.resolve({ status: true, data: [{ id: 1, name: 'Panels' }] });
      if (path.includes('items'))
        return Promise.resolve({
          status: true,
          data: [{ id: 2, name: 'Panel', price: 118, um: 'panel', total_qty: 4 }],
        });
      return Promise.resolve({
        status: true,
        data: [{ id: 3, name: 'Canadian Solar', status: 'active' }],
      });
    });
    mocks.brokerRequest.mockImplementation(({ path }: { path: string }) => {
      if (path.includes('featured'))
        return Promise.resolve({
          success: true,
          data: [{ listing_id: 'D-1', name: 'Featured deal', price_per_watt: 0.19 }],
        });
      if (path.includes('recent'))
        return Promise.resolve({
          success: true,
          data: [{ listing_id: 'D-2', name: 'Recent deal', price_per_watt: 0.2 }],
        });
      if (path.includes('graph'))
        return Promise.resolve({
          success: true,
          data: {
            panels: { list: [{ listing_id: 'D-3', name: 'Pickup deal', price_per_watt: 0.18 }] },
          },
        });
      return Promise.resolve({
        success: true,
        data: [{ listing_id: 'D-4', name: 'Hot deal', price_per_watt: 0.17 }],
      });
    });
  });

  it('normalizes main and broker responses into homepage sections', async () => {
    const result = await loadHomeData();

    expect(result.categories[0].name).toBe('Panels');
    expect(result.buyDirectProducts[0]).toMatchObject({ name: 'Panel', price: 118, unit: 'panel' });
    expect(result.featuredDeals[0]).toMatchObject({ name: 'Featured deal', pricePerWatt: 0.19 });
    expect(result.recentDeals[0].name).toBe('Recent deal');
    expect(result.hotDeal?.name).toBe('Hot deal');
    expect(result.brands[0]).toMatchObject({ name: 'Canadian Solar', initials: 'CA' });
  });

  it('keeps the homepage usable when broker requests fail', async () => {
    mocks.brokerRequest.mockRejectedValue(new Error('broker unavailable'));

    const result = await loadHomeData();

    expect(result.categories.length).toBeGreaterThan(0);
    expect(result.featuredDeals).toEqual([]);
    expect(result.pickupDeals).toEqual([]);
    expect(result.hotDeal).toBeNull();
  });
});
