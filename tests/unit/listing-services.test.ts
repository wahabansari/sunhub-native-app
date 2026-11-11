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

const { searchDeals, getDeal, getDealFilterOptions } =
  await import('@/services/catalog/deal-service');
const { searchProducts, getProduct, countProducts, listBrands, listSubCategories, listSectors } =
  await import('@/services/catalog/product-service');

describe('deal service', () => {
  beforeEach(() => {
    mocks.brokerRequest.mockReset();
    mocks.mainRequest.mockReset();
  });

  it('requests a filtered page and reads pagination', async () => {
    mocks.brokerRequest.mockResolvedValue({
      success: true,
      data: [{ listing_id: 'D1', title: 'Deal', sunhub_price: 0.2, listing_type: 'panels' }],
      pagination: { total: 43, current_page: 2, totalPages: 3 },
    });

    const page = await searchDeals({ selection: { state: ['CA'], brand: ['Trina Solar'] } }, 2);

    expect(mocks.brokerRequest).toHaveBeenCalledWith({
      path: 'listing/public/deals?limit=12&page=2&brand=Trina%20Solar&state=CA',
    });
    expect(page).toMatchObject({ total: 43, page: 2, hasMore: true });
    expect(page.items[0]).toMatchObject({ id: 'D1', pricePerWatt: 0.2 });
  });

  it('returns null for malformed ids without calling the API', async () => {
    await expect(getDeal('../etc')).resolves.toBeNull();
    expect(mocks.brokerRequest).not.toHaveBeenCalled();
  });

  it('loads a deal by id and reads filter options from the sidebar', async () => {
    mocks.brokerRequest.mockResolvedValueOnce({
      success: true,
      data: { listing_id: 'D9', title: 'Nine', sunhub_price: 0.3, status: 'Active' },
    });
    await expect(getDeal('D9')).resolves.toMatchObject({ id: 'D9', name: 'Nine' });
    expect(mocks.brokerRequest).toHaveBeenCalledWith({ path: 'listing/D9' });

    mocks.brokerRequest.mockResolvedValueOnce({
      data: {
        state: {
          data: [
            { state: 'OH', count: 5 },
            { state: 'CA', count: 9 },
          ],
        },
        brands: { data: ['SMA', 'Enphase'] },
        incoterms: { data: [{ incoterm: 'EXW - Ex Works (Place)', count: 12 }] },
        inverter_sector_type: { data: [{ type: 'ground_mount', count: 3 }] },
        categories: {
          data: {
            data: [{ name: 'Solar Panels', children: [{ name: 'Bifacial' }, { name: '' }] }],
          },
        },
      },
    });
    const options = await getDealFilterOptions();

    expect(options.states).toEqual([
      { value: 'CA', label: 'CA', count: 9 },
      { value: 'OH', label: 'OH', count: 5 },
    ]);
    expect(options.brands).toEqual([
      { value: 'Enphase', label: 'Enphase' },
      { value: 'SMA', label: 'SMA' },
    ]);
    expect(options.incoterms).toEqual([
      { value: 'EXW', label: 'EXW - Ex Works (Place)', count: 12 },
    ]);
    expect(options.sectors).toEqual([{ value: 'ground_mount', label: 'Ground Mount', count: 3 }]);
    expect(options.subCategories.panels).toEqual([{ value: 'Bifacial', label: 'Bifacial' }]);
  });
});

describe('product service', () => {
  beforeEach(() => {
    mocks.mainRequest.mockReset();
  });

  it('searches products and counts a category using the pagination total', async () => {
    mocks.mainRequest.mockResolvedValue({
      data: [{ uuid: 'P1', name: 'Panel', price: '10.00', total_qty: 3 }],
      pagination: { total: 65, current_page: 1, last_page: 4 },
    });

    const page = await searchProducts({}, 1);
    expect(page).toMatchObject({ total: 65, hasMore: true });
    expect(page.items[0]).toMatchObject({ id: 'P1', price: 10 });
    await expect(countProducts(40939)).resolves.toBe(65);
  });

  it('loads a product by uuid and rejects malformed uuids', async () => {
    mocks.mainRequest.mockResolvedValue({
      data: [{ uuid: 'P1', name: 'Panel', price: '10.00', total_qty: 3, moq: 1 }],
    });

    await expect(getProduct('P1')).resolves.toMatchObject({ id: 'P1', name: 'Panel' });
    expect(mocks.mainRequest.mock.calls[0][0].body.where).toEqual([['uuid', 'P1']]);
    await expect(getProduct('a b')).resolves.toBeNull();
  });

  it('lists brands sorted by name and skips invalid rows', async () => {
    mocks.mainRequest.mockResolvedValue({
      data: [
        { id: 2, name: 'Zed' },
        { id: 1, name: 'Alpha' },
        { id: 0, name: 'Bad' },
        { id: 3, name: '' },
      ],
    });

    await expect(listBrands()).resolves.toEqual([
      { id: 1, name: 'Alpha' },
      { id: 2, name: 'Zed' },
    ]);
  });

  it('lists active sub-categories of a parent category', async () => {
    mocks.mainRequest.mockResolvedValue({
      data: [
        { id: 41117, name: 'Bifacial', is_active: 1 },
        { id: 41118, name: 'Hidden', is_active: 0 },
        { id: 0, name: 'Bad', is_active: 1 },
      ],
    });

    await expect(listSubCategories(40939)).resolves.toEqual([
      { value: '41117', label: 'Bifacial' },
    ]);
    expect(mocks.mainRequest.mock.calls[0][0].body.where).toEqual([['parent_id', 40939]]);
  });

  it('lists inverter sectors that have listings', async () => {
    mocks.mainRequest.mockResolvedValue([
      { name: 'Residential', count: 41 },
      { name: 'Empty', count: 0 },
    ]);

    await expect(listSectors()).resolves.toEqual([
      { value: 'Residential', label: 'Residential', count: 41 },
    ]);
  });
});
