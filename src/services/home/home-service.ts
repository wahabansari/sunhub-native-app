import { apiClient, brokerApiClient } from '@/services/api';
import { env } from '@/config/env';
import { API_ENDPOINTS, EXTERNAL_ENDPOINTS } from '@/constants/api';
import type { ApiEnvelope } from '@/types/api';
import type {
  HomeArticle,
  HomeBrand,
  HomeCategory,
  HomeData,
  HomeDeal,
  HomeProduct,
} from '@/types/home';

type RecordValue = Record<string, unknown>;

const CATEGORY_SEEDS: HomeCategory[] = [
  { id: '40939', name: 'Solar Panels', icon: 'sunny-outline' },
  { id: '40948', name: 'Solar Inverters', icon: 'flash-outline' },
  { id: '40957', name: 'Solar Batteries', icon: 'battery-half-outline' },
  { id: '40960', name: 'Racking & Mounts', icon: 'grid-outline' },
  { id: '41094', name: 'DIY Kits & Equipment', icon: 'build-outline' },
  { id: '41189', name: 'Solar Lights', icon: 'bulb-outline' },
  { id: '41198', name: 'EV Charging Stations', icon: 'car-outline' },
];

const ARTICLE_SEEDS: HomeArticle[] = [
  {
    id: 'testing',
    title: 'Electroluminescence testing for solar panels: how it works and why it matters',
    category: 'Testing',
  },
  {
    id: 'traceability',
    title: 'Solar supply chain traceability: why it matters for manufacturers and buyers',
    category: 'Supply chain',
  },
  {
    id: 'feoc',
    title: 'FEOC compliance for solar: what U.S. developers and buyers need to know',
    category: 'Compliance',
  },
  {
    id: 'inverters',
    title: 'Pure sine wave vs. modified sine wave inverter: key differences',
    category: 'Inverters',
  },
];

const BLOG_API_URL = `${EXTERNAL_ENDPOINTS.blogPosts}?per_page=6&page=1&_embed`;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : Number(value) || fallback;
}

function shippingLabel(value: unknown): string {
  const normalized = stringValue(value).toLowerCase();
  if (normalized.includes('free')) return 'Free Shipping';
  if (normalized.includes('local') || normalized.includes('pickup')) return 'Local Pickup';
  return 'Shipping at checkout';
}

function firstImage(value: unknown): string | undefined {
  const images = Array.isArray(value) ? value : [];
  const image = images.find(
    (entry) => isRecord(entry) && stringValue(entry.type).toLowerCase() !== 'document',
  );
  if (!isRecord(image)) return undefined;
  const path = stringValue(image.url || image.path || image.image || image.thumbnail || image.src);
  if (!path) return undefined;
  return /^https?:\/\//i.test(path) ? path : `${env.mediaBaseUrl}/${path.replace(/^\/+/, '')}`;
}

function rowsFrom(payload: unknown): RecordValue[] {
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (!isRecord(payload)) return [];
  const data = payload.data;
  if (Array.isArray(data)) return data.filter(isRecord);
  if (isRecord(data)) return rowsFrom(data);
  for (const key of ['deals', 'listings', 'products', 'items', 'brands']) {
    if (Array.isArray(payload[key])) return payload[key].filter(isRecord);
  }
  return [];
}

function rowsFromGraph(payload: unknown): RecordValue[] {
  const direct = rowsFrom(payload);
  if (direct.length) return direct;
  if (!isRecord(payload)) return [];
  const data = isRecord(payload.data) ? payload.data : payload;
  const panels = isRecord(data.panels) ? data.panels : undefined;
  return panels && Array.isArray(panels.list) ? panels.list.filter(isRecord) : [];
}

function normalizeDeal(value: RecordValue, index: number): HomeDeal {
  const item = isRecord(value.item) ? value.item : value;
  const details = isRecord(value.productDetails) ? value.productDetails : {};
  const creator = isRecord(value.listing_creator) ? value.listing_creator : {};
  const price = numberValue(
    value.price_per_watt ?? value.pricePerWatt ?? value.sunhub_price ?? value.price ?? item.price,
  );
  const compareAt = numberValue(
    value.compare_at ?? value.msrp ?? value.original_price ?? value.originalPrice,
    0,
  );
  const address = isRecord(value.address) ? value.address : {};
  const city = stringValue(value.city ?? address.city);
  const state = stringValue(value.state ?? address.state);
  const terms = isRecord(value.terms) ? value.terms : {};
  return {
    id: stringValue(value.id ?? value.uuid ?? value.listing_id, `deal-${index}`),
    name: stringValue(
      value.name ?? value.title ?? details.name ?? item.name,
      'Solar equipment deal',
    ),
    pricePerWatt: price,
    compareAt: compareAt > price ? compareAt : undefined,
    moq: stringValue(value.moq ?? value.pallet_quantity ?? value.pieces_pallets, '1 pallet'),
    moqUnit: stringValue(value.moq_unit, 'pallets'),
    location:
      [city, state].filter(Boolean).join(', ') ||
      stringValue(value.address ?? value.locations, 'Nationwide'),
    imageUrl: firstImage(value.images ?? value.attachments ?? creator.productImages ?? item.images),
    sponsored: value.sponsored === true || value.isFeatured === true,
    tags: [value.domestic_content, value.cec, value.fcc].filter(
      (tag): tag is string => typeof tag === 'string' && tag.trim().length > 0,
    ),
    brand: stringValue(value.brand),
    wattage: stringValue(value.wattage ?? value.panel),
    shipping: stringValue(terms.shipping ?? terms.incoterms),
  };
}

function normalizeProduct(value: RecordValue, index: number): HomeProduct {
  const basePrice = numberValue(value.price ?? value.salePrice);
  const discount = numberValue(value.discount, 0);
  const price =
    value.discount_unit === 'percent'
      ? basePrice - (basePrice / 100) * discount
      : value.discount_unit === 'fixed'
        ? basePrice - discount
        : basePrice;
  const category = isRecord(value.category) ? value.category : {};
  const brand = isRecord(value.brand) ? value.brand : {};
  return {
    id: stringValue(value.uuid ?? value.id, `product-${index}`),
    name: stringValue(value.name, 'Solar equipment'),
    price,
    unit: stringValue(value.um ?? value.unit, 'unit'),
    imageUrl: firstImage(value.images),
    shippingLabel: shippingLabel(value.shipping_type),
    stock: numberValue(value.total_qty, 0),
    sponsored: value.sponsored === true || value.is_featured_product === true,
    brand: stringValue(brand.name),
    category: stringValue(category.name),
    condition: stringValue(value.condition),
  };
}

function normalizeBrand(value: RecordValue, index: number): HomeBrand {
  const name = stringValue(value.name, 'Brand');
  return {
    id: stringValue(value.id, `brand-${index}`),
    name,
    initials: name.slice(0, 2).toUpperCase(),
  };
}

function normalizeArticle(value: RecordValue, index: number): HomeArticle {
  const title = isRecord(value.title) ? value.title : {};
  const renderedTitle = stringValue(
    title.rendered ?? value.name,
    ARTICLE_SEEDS[index]?.title ?? '',
  );
  return {
    id: stringValue(value.id, ARTICLE_SEEDS[index]?.id ?? `article-${index}`),
    title: renderedTitle.replace(/<[^>]*>/g, ''),
    category: 'Guides',
  };
}

async function requestMain<T>(path: string, body: unknown): Promise<T | undefined> {
  const response = await apiClient.request<ApiEnvelope<T>>({ path, method: 'POST', body });
  return response?.status === false ? undefined : response?.data;
}

async function requestBroker(path: string): Promise<unknown> {
  if (!brokerApiClient) return undefined;
  return brokerApiClient.request<unknown>({ path });
}

async function requestBlog(): Promise<unknown> {
  try {
    const response = await fetch(BLOG_API_URL);
    return response.ok ? response.json() : undefined;
  } catch {
    return undefined;
  }
}

const PRODUCT_FIELDS =
  'id uuid owner_id name description condition category_id brand_id price is_taxable cost discount discount_unit age age_unit moq total_qty um msrp mpn weight weight_unit length length_unit width width_unit package_type upc part_number sku last_sku type publish_date is_active reviews_total reviews_avg options variants scalling_price created_at shipping_type is_featured_product custom_tag'.split(
    ' ',
  );

const productBody = {
  fields: PRODUCT_FIELDS,
  with: ['images', 'category', 'brand', 'bulk_savings', 'owner'],
  where: [
    ['is_active', 1],
    ['total_qty', '>', 0],
    ['status', 'approved'],
  ],
  where_has: { category: { where: [['parent_id', 40939]] } },
  limit: 6,
  page: 1,
  orderby: { id: 'DESC', total_qty: 'DESC' },
};

export async function loadHomeData(): Promise<HomeData> {
  const results = await Promise.allSettled([
    requestMain<unknown[]>(API_ENDPOINTS.catalog.categoriesSearch, {
      fields: ['id', 'name'],
      limit: 20,
    }),
    requestBroker(`${API_ENDPOINTS.broker.featuredListings}?listing_type=panels`),
    requestBroker(
      `${API_ENDPOINTS.broker.graphListings}?state=CA&page=1&limit=20&listing_type=panels`,
    ),
    requestMain<unknown[]>(API_ENDPOINTS.catalog.productsSearch, productBody),
    requestBroker(`${API_ENDPOINTS.broker.recentListings}?listing_type=panels`),
    requestBroker(
      `${API_ENDPOINTS.broker.publicListings}?page=1&sort=recommended&homePage=true&isHotDeal=true`,
    ),
    requestMain<unknown[]>(API_ENDPOINTS.catalog.brandsSearch, {
      fields: ['id', 'name', 'status'],
      limit: 7,
    }),
    requestBlog(),
  ]);

  const valueAt = (index: number): unknown =>
    results[index].status === 'fulfilled' ? results[index].value : undefined;
  const categories = CATEGORY_SEEDS.map((seed, index) => {
    const row = rowsFrom(valueAt(0))[index];
    return row
      ? { ...seed, id: stringValue(row.id, seed.id), name: stringValue(row.name, seed.name) }
      : seed;
  });
  const featuredDeals = rowsFrom(valueAt(1)).map(normalizeDeal).slice(0, 6);
  const pickupRows = rowsFromGraph(valueAt(2));
  const pickupDeals = pickupRows.map(normalizeDeal).slice(0, 6);
  const buyDirectProducts = rowsFrom(valueAt(3)).map(normalizeProduct).slice(0, 6);
  const recentDeals = rowsFrom(valueAt(4)).map(normalizeDeal).slice(0, 6);
  const hotDeals = rowsFrom(valueAt(5)).map(normalizeDeal);
  const brands = rowsFrom(valueAt(6)).map(normalizeBrand).slice(0, 7);
  const articles = rowsFrom(valueAt(7)).map(normalizeArticle).slice(0, 6);

  return {
    categories: categories.length ? categories : CATEGORY_SEEDS,
    featuredDeals,
    pickupDeals,
    buyDirectProducts,
    recentDeals,
    hotDeal: hotDeals[0] ?? featuredDeals[0] ?? null,
    brands,
    articles: articles.length ? articles : ARTICLE_SEEDS,
  };
}
