import type { DealDetail, DetailDocument, DetailSpec, ProductDetail } from '@/types/listing';
import { COMPLIANCE_OPTIONS, complianceFlagsFromItem } from '@/utils/compliance';
import { decodeHtmlEntities, moqLabel } from '@/utils/home-format';

import {
  imageUrls,
  isRecord,
  mediaUrl,
  normalizeDeal,
  normalizeProduct,
  numberValue,
  recordFrom,
  stringValue,
  type RecordValue,
} from './catalog-normalizers';

const MAX_DESCRIPTION = 700;

function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function spec(label: string, value: unknown, suffix = ''): DetailSpec | null {
  const text = typeof value === 'number' ? String(value) : stringValue(value);
  return text ? { label, value: `${text}${suffix}` } : null;
}

function present(specs: (DetailSpec | null)[]): DetailSpec[] {
  return specs.filter((entry): entry is DetailSpec => entry !== null);
}

function plainText(html: unknown): string | undefined {
  const text = decodeHtmlEntities(stringValue(html).replace(/<\/(p|h\d|li)>/gi, '\n'))
    .replace(/\n{2,}/g, '\n')
    .trim();
  if (!text) return undefined;
  return text.length > MAX_DESCRIPTION ? `${text.slice(0, MAX_DESCRIPTION).trimEnd()}…` : text;
}

function dimensions(row: RecordValue, unit: unknown): string | undefined {
  const parts = [row.length, row.width, row.height].map((value) => numberValue(value, 0));
  if (parts.some((value) => value <= 0)) return undefined;
  return `${parts.join(' × ')} ${stringValue(unit, 'in')}`;
}

function dynamicSpecs(value: unknown): DetailSpec[] {
  if (!isRecord(value)) return [];
  return present(
    Object.values(value).map((field) =>
      isRecord(field) ? spec(stringValue(field.label), field.value) : null,
    ),
  ).filter((entry) => entry.label);
}

export function mapProductDetail(row: RecordValue): ProductDetail | null {
  const base = normalizeProduct(row, 0);
  if (!stringValue(row.uuid)) return null;
  const age = numberValue(row.age, 0);
  const weight = numberValue(row.weight, 0);

  return {
    id: base.id,
    name: base.name,
    brand: base.brand || undefined,
    category: base.category || undefined,
    price: base.price,
    unit: base.unit,
    stock: base.stock ?? 0,
    moq: Math.max(1, numberValue(row.moq, 1)),
    imageUrls: imageUrls(row.images),
    sponsorLabel: base.sponsorLabel,
    badges: base.badges,
    shippingLabel: base.shippingLabel ?? 'Shipping at checkout',
    description: plainText(row.description),
    specs: present([
      spec('Condition', capitalize(stringValue(row.condition))),
      spec('Age', age > 0 ? `${age} ${stringValue(row.age_unit, 'years')}` : ''),
      spec('SKU', row.sku),
      spec('Part number', row.part_number),
      spec('MPN', row.mpn),
      spec('UPC', row.upc),
      spec('Weight', weight > 0 ? `${weight} ${stringValue(row.weight_unit, 'lb')}` : ''),
      spec('Dimensions', dimensions(row, row.length_unit)),
      ...dynamicSpecs(row.dynamic_fields),
    ]),
  };
}

function documentsOf(attachments: unknown): DetailDocument[] {
  const documents: DetailDocument[] = [];
  for (const entry of Array.isArray(attachments) ? attachments : []) {
    if (!isRecord(entry) || stringValue(entry.type).toLowerCase() !== 'document') continue;
    const path = stringValue(entry.path);
    if (!path) continue;
    const name = stringValue(entry.label || entry.original_name, 'Document');
    documents.push({ name, url: mediaUrl(path) });
  }
  return documents;
}

function availability(row: RecordValue): string | undefined {
  const quantity = recordFrom(row.quantity_calculator === 'fpq' ? row.fpq : row.qoh);
  const panels = numberValue(quantity.panel, 0);
  const pallets = numberValue(quantity.pallet, 0);
  if (panels > 0 && pallets > 0)
    return `${panels.toLocaleString('en-US')} panels · ${pallets} pallets`;
  if (pallets > 0) return `${pallets} pallets`;
  const total = numberValue(row.totalQty, 0);
  return total > 0 ? total.toLocaleString('en-US') : undefined;
}

export function mapDealDetail(row: RecordValue): DealDetail | null {
  if (stringValue(row.status) === 'Disabled') return null;
  const base = normalizeDeal(row, 0);
  const terms = recordFrom(row.terms);
  const flags = complianceFlagsFromItem(row);
  const moq = Math.max(1, numberValue(row.moq, 1));
  const perPallet = numberValue(row.pallet_quantity, 0);
  const watts = numberValue(row.wattage, 0);
  const panels = moq * perPallet;
  const compareAt = base.compareAt;

  return {
    id: base.id,
    name: base.name,
    brand: base.brand || undefined,
    category: base.category,
    subCategory: stringValue(row.sub_category) || undefined,
    perWatt: base.perWatt,
    price: base.pricePerWatt,
    compareAt,
    discountPercent: compareAt
      ? Math.round(((compareAt - base.pricePerWatt) / compareAt) * 100)
      : undefined,
    imageUrls: imageUrls(row.attachments, row.images),
    location: base.location ?? 'Nationwide',
    moq: moqLabel(base.moq, base.moqUnit),
    available: availability(row),
    shipping: stringValue(terms.incoterms) || undefined,
    paymentTerms: plainText(terms.payment_terms),
    sponsored: base.sponsored ?? false,
    badges: COMPLIANCE_OPTIONS.filter((option) => flags[option.key]).map((option) => option.label),
    estimateAtMoq:
      base.perWatt && panels > 0 && watts > 0
        ? { panels, total: panels * watts * base.pricePerWatt }
        : undefined,
    description: plainText(row.product_description),
    specs: present([
      spec('Condition', capitalize(stringValue(row.condition))),
      spec('Sub-category', row.sub_category),
      spec('Part number', row.part_no),
      spec('Wattage', row.wattage, ' W'),
      spec('Cell type', row.cell_type),
      spec('Colour', capitalize(stringValue(row.color))),
      spec('Volts', row.volts),
      spec('Panels per pallet', perPallet > 0 ? perPallet : ''),
      spec('Dimensions', dimensions(row, row.unit_length)),
      spec('Weight', row.weight),
      spec('Wind load', row.wind_load),
      spec('Snow load', row.snow_load),
      spec('Product age', row.product_age),
    ]),
    documents: documentsOf(row.attachments),
  };
}
