import { env } from '@/config/env';
import type { HomeArticle, HomeBrand, HomeDeal, HomeProduct, PickupState } from '@/types/home';
import { COMPLIANCE_OPTIONS, complianceFlagsFromItem } from '@/utils/compliance';
import { decodeHtmlEntities, initialsOf, listingLabel } from '@/utils/home-format';

export type RecordValue = Record<string, unknown>;

const MAX_TAG_LENGTH = 20;

export const ARTICLE_SEEDS: HomeArticle[] = [
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

export function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function idValue(value: unknown, fallback: string): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? String(value)
    : stringValue(value, fallback);
}

export function numberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : Number(value) || fallback;
}

export function recordFrom(value: unknown): RecordValue {
  return isRecord(value) ? value : {};
}

export function mediaUrl(path: string): string {
  return /^https?:\/\//i.test(path) ? path : `${env.mediaBaseUrl}/${path.replace(/^\/+/, '')}`;
}

function textValue(value: unknown, fallback = ''): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? String(value)
    : stringValue(value, fallback);
}

export function imageUrls(...sources: unknown[]): string[] {
  const urls: string[] = [];
  for (const source of sources) {
    for (const entry of Array.isArray(source) ? source : []) {
      if (!isRecord(entry) || stringValue(entry.type).toLowerCase() === 'document') continue;
      const path = stringValue(
        entry.url || entry.path || entry.image || entry.thumbnail || entry.src,
      );
      if (path) urls.push(mediaUrl(path));
    }
    if (urls.length) break;
  }
  return urls;
}

function firstImage(...sources: unknown[]): string | undefined {
  for (const source of sources) {
    const images = Array.isArray(source) ? source : [];
    const image = images.find(
      (entry) => isRecord(entry) && stringValue(entry.type).toLowerCase() !== 'document',
    );
    if (!isRecord(image)) continue;
    const path = stringValue(
      image.url || image.path || image.image || image.thumbnail || image.src,
    );
    if (path) return mediaUrl(path);
  }
  return undefined;
}

function isFlagOn(value: unknown): boolean {
  return value === true || value === 1 || value === '1';
}

export function rowsFrom(payload: unknown): RecordValue[] {
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

/** Reads the shared `pagination` block (main and broker APIs use the same keys). */
export function pageInfo(payload: unknown, fallbackCount: number) {
  const block = isRecord(payload) && isRecord(payload.pagination) ? payload.pagination : {};
  const total = numberValue(block.total, fallbackCount);
  const page = numberValue(block.current_page, 1);
  const lastPage = numberValue(block.last_page ?? block.totalPages ?? block.total_pages, page);
  return { total, page, hasMore: page < lastPage };
}

const STATE_CODE = /^[A-Z]{2}$/;

/** Reads `data.state.data` from `broker/sidebar_data`, the source the web pickup map colours states from. */
export function normalizePickupStates(payload: unknown): PickupState[] {
  const data = isRecord(payload) && isRecord(payload.data) ? payload.data : {};
  const block = isRecord(data.state) ? data.state : {};
  const entries = Array.isArray(block.data) ? block.data.filter(isRecord) : [];
  const states: PickupState[] = [];

  for (const entry of entries) {
    const code = stringValue(entry.state).toUpperCase();
    const total = numberValue(entry.count, 0);
    if (STATE_CODE.test(code) && total > 0) states.push({ code, total });
  }
  return states;
}

function moqValue(raw: unknown): string {
  return textValue(raw, '1');
}

export function normalizeDeal(value: RecordValue, index: number): HomeDeal {
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
    id: idValue(value.id ?? value.uuid ?? value.listing_id, `deal-${index}`),
    name: stringValue(
      value.name ?? value.title ?? details.name ?? item.name,
      'Solar equipment deal',
    ),
    pricePerWatt: price,
    compareAt: compareAt > price ? compareAt : undefined,
    moq: moqValue(value.moq ?? value.pallet_quantity ?? value.pieces_pallets),
    moqUnit: stringValue(value.moq_unit, 'pallets'),
    location:
      [city, state].filter(Boolean).join(', ') ||
      stringValue(value.address ?? value.locations, 'Nationwide'),
    imageUrl: firstImage(value.images, value.attachments, creator.productImages, item.images),
    sponsored: isFlagOn(value.sponsored) || isFlagOn(value.isFeatured),
    brand: stringValue(value.brand),
    wattage: textValue(value.wattage),
    shipping: stringValue(terms.shipping ?? terms.incoterms),
    category: listingLabel(value.listing_type) ?? (stringValue(value.sub_category) || undefined),
    perWatt: value.listing_type === undefined || value.listing_type === 'panels',
    badges: complianceBadges(value),
  };
}

function complianceBadges(item: RecordValue): string[] {
  const flags = complianceFlagsFromItem(item);
  return COMPLIANCE_OPTIONS.filter((option) => flags[option.key]).map((option) => option.label);
}

function sponsorLabel(value: RecordValue): string | undefined {
  if (!isFlagOn(value.is_featured_product)) return undefined;
  const tag = stringValue(value.custom_tag);
  if (!tag) return 'Sponsored';
  return tag.length > MAX_TAG_LENGTH ? `${tag.slice(0, MAX_TAG_LENGTH - 1)}…` : tag;
}

function shippingLabel(value: unknown): string {
  const normalized = stringValue(value).toLowerCase();
  if (normalized.includes('free')) return 'Free Shipping';
  if (normalized.includes('local') || normalized.includes('pickup')) return 'Local Pickup';
  return 'Shipping at checkout';
}

export function normalizeProduct(value: RecordValue, index: number): HomeProduct {
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
    id: idValue(value.uuid ?? value.id, `product-${index}`),
    name: stringValue(value.name, 'Solar equipment'),
    price,
    unit: stringValue(value.um ?? value.unit, 'unit'),
    imageUrl: firstImage(value.images),
    shippingLabel: shippingLabel(value.shipping_type),
    stock: numberValue(value.total_qty, 0),
    moq: Math.max(1, numberValue(value.moq, 1)),
    sponsorLabel: sponsorLabel(value),
    badges: complianceBadges(value),
    brand: stringValue(brand.name),
    category: stringValue(category.name),
    condition: stringValue(value.condition),
  };
}

export function brandLogoUrl(logo: unknown): string | undefined {
  const path = stringValue(logo);
  return path ? mediaUrl(path) : undefined;
}

export function normalizeBrand(value: RecordValue, index: number): HomeBrand {
  const name = stringValue(value.name, 'Brand');
  return {
    id: idValue(value.id, `brand-${index}`),
    name,
    initials: initialsOf(name),
    logoUrl: brandLogoUrl(value.logo ?? value.logo_url ?? value.image),
  };
}

function embeddedImage(value: RecordValue): string | undefined {
  const embedded = isRecord(value._embedded) ? value._embedded : {};
  const media = Array.isArray(embedded['wp:featuredmedia'])
    ? embedded['wp:featuredmedia'][0]
    : null;
  const source = isRecord(media) ? stringValue(media.source_url) : '';
  return /^https:\/\//i.test(source) ? source : undefined;
}

function articleUrl(value: RecordValue): string | undefined {
  const link = stringValue(value.link);
  return /^https:\/\//i.test(link) ? link : undefined;
}

export function normalizeArticle(value: RecordValue, index: number): HomeArticle {
  const title = isRecord(value.title) ? value.title : {};
  const renderedTitle = stringValue(
    title.rendered ?? value.name,
    ARTICLE_SEEDS[index]?.title ?? '',
  );
  return {
    id: idValue(value.id, ARTICLE_SEEDS[index]?.id ?? `article-${index}`),
    title: decodeHtmlEntities(renderedTitle),
    category: 'Guides',
    imageUrl: embeddedImage(value),
    url: articleUrl(value),
  };
}
