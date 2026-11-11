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

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const {
  loadArticles,
  loadBrands,
  loadBuyDirectProducts,
  loadFeaturedDeals,
  loadPickupStates,
  loadRecentDeals,
  loadSpotlightDeals,
} = await import('@/services/home/home-service');

describe('home section loaders', () => {
  beforeEach(() => {
    mocks.mainRequest.mockReset();
    mocks.brokerRequest.mockReset();
    fetchMock.mockReset();
  });

  it('loads and normalizes the broker deal sections', async () => {
    mocks.brokerRequest.mockResolvedValue({
      success: true,
      data: [{ listing_id: 'D-1', title: 'A deal', sunhub_price: 0.19, listing_type: 'panels' }],
    });

    await expect(loadFeaturedDeals()).resolves.toMatchObject([
      { id: 'D-1', name: 'A deal', pricePerWatt: 0.19, perWatt: true },
    ]);
    await expect(loadRecentDeals()).resolves.toHaveLength(1);
    await expect(loadSpotlightDeals()).resolves.toHaveLength(1);
    expect(mocks.brokerRequest).toHaveBeenCalledWith({
      path: 'listing/featured-deals?listing_type=panels',
      timeoutMs: 20_000,
    });
  });

  it('reads pickup states from the sidebar sorted by deal count', async () => {
    mocks.brokerRequest.mockResolvedValue({
      data: {
        state: {
          data: [
            { state: 'TX', count: 24 },
            { state: 'CA', count: 65 },
          ],
        },
      },
    });

    await expect(loadPickupStates()).resolves.toEqual([
      { code: 'CA', total: 65 },
      { code: 'TX', total: 24 },
    ]);
  });

  it('loads products and brands from the main API', async () => {
    mocks.mainRequest.mockImplementation(({ path }: { path: string }) =>
      Promise.resolve(
        path.includes('items')
          ? {
              status: true,
              data: [{ id: 2, name: 'Panel', price: 118, um: 'panel', total_qty: 4 }],
            }
          : {
              status: true,
              data: [{ id: 3, name: 'Canadian Solar', status: 'active', logo: 'brands/cs.png' }],
            },
      ),
    );

    await expect(loadBuyDirectProducts()).resolves.toMatchObject([
      { name: 'Panel', price: 118, unit: 'panel' },
    ]);
    const brands = await loadBrands();
    expect(brands[0]).toMatchObject({ name: 'Canadian Solar', initials: 'CS' });
    expect(brands[0].logoUrl).toMatch(/\/brands\/cs\.png$/);
  });

  it('asks for sponsored products first and falls back to the newest when none are running', async () => {
    const row = { uuid: 'S1', name: 'Sponsored panel', price: '10.00', total_qty: 2 };
    mocks.mainRequest
      .mockResolvedValueOnce({ data: [row] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [{ ...row, uuid: 'N1', name: 'Newest panel' }] });

    await expect(loadBuyDirectProducts()).resolves.toMatchObject([{ id: 'S1' }]);
    expect(mocks.mainRequest.mock.calls[0][0].body.where).toContainEqual([
      'is_featured_product',
      1,
    ]);
    expect(mocks.mainRequest.mock.calls[0][0].body.limit).toBe(6);

    await expect(loadBuyDirectProducts()).resolves.toMatchObject([{ id: 'N1' }]);
    expect(mocks.mainRequest.mock.calls[2][0].body.where).not.toContainEqual([
      'is_featured_product',
      1,
    ]);
  });

  it('throws when a broker request fails so the section can show a retry state', async () => {
    mocks.brokerRequest.mockRejectedValue(new Error('broker unavailable'));

    await expect(loadFeaturedDeals()).rejects.toThrow('broker unavailable');
    await expect(loadPickupStates()).rejects.toThrow('broker unavailable');
  });

  it('falls back to the bundled articles when the blog cannot be reached', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    const offline = await loadArticles();
    expect(offline.length).toBeGreaterThan(0);

    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          { id: 1, title: { rendered: 'Live &amp; fresh' }, link: 'https://www.sunhub.com/blog/a' },
        ]),
    });
    await expect(loadArticles()).resolves.toMatchObject([
      { title: 'Live & fresh', url: 'https://www.sunhub.com/blog/a' },
    ]);
  });
});
