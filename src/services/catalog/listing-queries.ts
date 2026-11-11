import type { DealFilters, FilterSelection, ProductFilters } from '@/types/listing';

export const LISTING_PAGE_SIZE = 12;

const PRODUCT_LIST_FIELDS = [
  'id',
  'uuid',
  'name',
  'price',
  'discount',
  'discount_unit',
  'um',
  'total_qty',
  'shipping_type',
  'is_featured_product',
  'custom_tag',
  'cec_listed',
  'feoc_compliant',
];

export const PRODUCT_DETAIL_FIELDS = [
  ...PRODUCT_LIST_FIELDS,
  'description',
  'condition',
  'category_id',
  'brand_id',
  'age',
  'age_unit',
  'moq',
  'moq_unit',
  'mpn',
  'sku',
  'upc',
  'part_number',
  'weight',
  'weight_unit',
  'length',
  'width',
  'height',
  'length_unit',
  'dynamic_fields',
];

/** Search text is sent as a SQL LIKE pattern, so wildcard characters are removed first. */
export function cleanSearch(value?: string): string {
  return (value ?? '')
    .replace(/[%_\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

function numbers(values: string[] | undefined): number[] {
  return (values ?? []).map(Number).filter((value) => Number.isInteger(value) && value > 0);
}

/** `400,495` -> `[400, 495]`, `600` -> `[600]`; anything else is dropped. */
export function parseWattage(value: string | undefined): number[] | undefined {
  if (!value) return undefined;
  const parts = value.split(',').map(Number);
  return parts.length <= 2 && parts.every((part) => Number.isFinite(part) && part > 0)
    ? parts
    : undefined;
}

export function buildProductBody(
  filters: ProductFilters,
  page: number,
  limit = LISTING_PAGE_SIZE,
  fields: string[] = PRODUCT_LIST_FIELDS,
) {
  const sel: FilterSelection = filters.selection ?? {};
  const search = cleanSearch(filters.search);
  const where: unknown[][] = [
    ['is_active', 1],
    ['total_qty', '>', 0],
    ['status', 'approved'],
  ];
  const whereIn: { field: string; value: (string | number)[] }[] = [];
  if (filters.sponsored) where.push(['is_featured_product', 1]);
  if (search) where.push(['name', 'like', `%${search}%`]);

  const subCategories = numbers(sel.subcategory);
  const categoryId = numbers(sel.category)[0];
  const brands = numbers(sel.brand);
  if (subCategories.length) whereIn.push({ field: 'category_id', value: subCategories });
  if (brands.length) whereIn.push({ field: 'brand_id', value: brands });
  if (sel.condition?.length) whereIn.push({ field: 'condition', value: sel.condition });
  if (sel.sector?.length) whereIn.push({ field: 'sector', value: sel.sector });
  if (sel.shipping?.length) {
    const shipping = [...sel.shipping];
    // Same rule as the web shop: local pickup also covers items that ship by FedEx or pick up.
    if (shipping.includes('local_pickup_only')) shipping.push('fedex_or_local_pickup');
    whereIn.push({ field: 'shipping_type', value: shipping });
  }

  const watts = parseWattage(sel.wattage?.[0]);

  return {
    fields,
    with: ['images', 'category', 'brand'],
    where,
    where_in: whereIn,
    ...(!subCategories.length && categoryId
      ? { where_has: { category: { where: [['parent_id', categoryId]] } } }
      : {}),
    ...(sel.availability?.[0] ? { availability: Number(sel.availability[0]) } : {}),
    ...(sel.compliance?.length ? { compliance: sel.compliance } : {}),
    ...(watts ? { dynamic_fields_key: 'watts', dynamic_fields_value: watts } : {}),
    limit,
    page,
    orderby: { id: 'DESC', total_qty: 'DESC' },
  };
}

export function buildDealQuery(filters: DealFilters, page: number, limit = LISTING_PAGE_SIZE) {
  const sel: FilterSelection = filters.selection ?? {};
  const params: [string, string][] = [
    ['limit', String(limit)],
    ['page', String(page)],
  ];
  const optional: [string, string | undefined][] = [
    ['listing_type', sel.type?.[0]],
    ['sub_category', sel.subcategory?.join(',')],
    ['brand', sel.brand?.join(',')],
    ['condition', sel.condition?.join(',')],
    ['state', sel.state?.join(',')],
    // The API matches the incoterm code ("EXW"), not the long label.
    ['incoterms', sel.incoterms?.join(',')],
    ['colors', sel.color?.join(',')],
    ['wattage', sel.wattage?.[0]],
    ['company_tier', sel.tier?.[0]],
    ['availability', sel.availability?.[0]],
    ['inverter_sector_type', sel.sector?.join(',')],
    ['cec_listed', sel.compliance?.includes('cec_listed') ? 'true' : undefined],
    ['feoc_compliant', sel.compliance?.includes('feoc_compliant') ? 'true' : undefined],
    ['search', cleanSearch(filters.search) || undefined],
  ];
  for (const [key, value] of optional) {
    if (value) params.push([key, value]);
  }
  return params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
}
