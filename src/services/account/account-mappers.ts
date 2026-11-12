import {
  idValue,
  imageUrls,
  isRecord,
  numberValue,
  pageInfo,
  recordFrom,
  stringValue,
} from '@/services/catalog/catalog-normalizers';
import type {
  AccountPage,
  OrderLine,
  OrderSummary,
  SellerListing,
  SoldItem,
} from '@/types/account';

function rowsOf(payload: unknown): Record<string, unknown>[] {
  const data = isRecord(payload) ? payload.data : undefined;
  return Array.isArray(data) ? data.filter(isRecord) : [];
}

function pageOf<T>(payload: unknown, items: T[]): AccountPage<T> {
  return { items, ...pageInfo(payload, items.length) };
}

function linesOf(row: Record<string, unknown>): OrderLine[] {
  const entries = Array.isArray(row.order_items) ? row.order_items.filter(isRecord) : [];
  return entries.map((entry) => ({
    name: stringValue(recordFrom(entry.item).name) || stringValue(entry.name, 'Item'),
    qty: Math.max(1, numberValue(entry.qty ?? entry.quantity, 1)),
  }));
}

export function normalizeOrders(payload: unknown): AccountPage<OrderSummary> {
  const items = rowsOf(payload).map((row, index) => ({
    id: idValue(row.id ?? row.uuid, `order-${index}`),
    number: stringValue(row.order_number),
    date: stringValue(row.created_at) || undefined,
    status: stringValue(row.status),
    total: numberValue(row.total_amount ?? row.total),
    shipping: numberValue(row.shipping_cost_estimated),
    tax: numberValue(row.total_tax_amount),
    lines: linesOf(row),
  }));
  return pageOf(payload, items);
}

export function normalizeListings(payload: unknown): AccountPage<SellerListing> {
  const items = rowsOf(payload)
    .filter((row) => stringValue(row.uuid) !== '')
    .map((row) => ({
      uuid: stringValue(row.uuid),
      name: stringValue(row.name, 'Untitled product'),
      price: numberValue(row.price),
      stock: numberValue(row.total_qty),
      unit: stringValue(row.um, 'unit'),
      isActive: row.is_active === undefined ? true : Boolean(numberValue(row.is_active)),
      status: stringValue(row.status),
      imageUrl: imageUrls(row.images)[0],
    }));
  return pageOf(payload, items);
}

export function normalizeSoldItems(payload: unknown): AccountPage<SoldItem> {
  const items = rowsOf(payload).map((row, index) => ({
    id: idValue(row.order_id ?? row.id, `sale-${index}`),
    customer: stringValue(row.customer_name, 'Customer'),
    date: stringValue(row.created_at) || undefined,
    status: stringValue(row.status),
    total: numberValue(row.total_amount),
    shipping: numberValue(row.shipping_cost),
    shippingType: stringValue(row.shipping_type),
  }));
  return pageOf(payload, items);
}
