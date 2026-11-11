import {
  imageUrls,
  isRecord,
  numberValue,
  recordFrom,
  stringValue,
  type RecordValue,
} from '@/services/catalog/catalog-normalizers';
import type { Cart, CartItem, FedexRate, OrderTotals, ShippingChoice } from '@/types/cart';

const SHIPPING_BY_TYPE: Record<string, ShippingChoice[]> = {
  fedex: ['FEDEX'],
  fedex_or_local_pickup: ['FEDEX', 'LOCAL_PICKUP'],
  free_shipping: ['FREE_SHIPPING'],
  local_pickup_only: ['LOCAL_PICKUP'],
  estimated_shipping: ['CALCULATED'],
};

export function shippingOptionsFor(type: unknown): ShippingChoice[] {
  return SHIPPING_BY_TYPE[stringValue(type)] ?? [];
}

/** The `shiping_type` value the cart API expects for each choice (the web app's spelling). */
export function cartShippingValue(choice: ShippingChoice): string {
  return choice === 'CALCULATED'
    ? 'ESTIMATED_SHIPPING'
    : choice === 'FEDEX'
      ? 'FEDEX_GROUND'
      : choice;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Unit price after a discount, or after the bulk-pricing tier the quantity falls in. */
export function unitPriceFor(item: RecordValue, qty: number): number {
  const price = numberValue(item.price);
  const discount = numberValue(item.discount);

  if (discount > 0 && item.discount_unit === 'percent')
    return round2(price - (price / 100) * discount);
  if (discount > 0 && item.discount_unit === 'fixed') return round2(price - discount);

  if (numberValue(item.scalling_price) && Array.isArray(item.bulk_savings)) {
    for (const tier of item.bulk_savings) {
      if (isRecord(tier) && qty >= numberValue(tier.min_qty) && qty <= numberValue(tier.max_qty)) {
        return numberValue(tier.discounted_price, price);
      }
    }
  }
  return price;
}

/** Clamps a quantity to what can be bought: at least the minimum order, at most the stock. */
export function clampQuantity(qty: number, moq: number, stock: number): number {
  const floor = Math.max(1, moq);
  const ceiling = Math.max(floor, stock);
  return Math.min(ceiling, Math.max(floor, Math.floor(qty)));
}

function normalizeCartRow(row: unknown): CartItem | null {
  if (!isRecord(row) || !isRecord(row.item)) return null;

  const item = row.item;
  const uuid = stringValue(item.uuid) || stringValue(row.item_uuid);
  if (!uuid) return null;

  const qty = Math.max(1, Math.floor(numberValue(row.qty, 1)));
  const moq = Math.max(1, numberValue(item.moq, 1));
  const stock = Math.max(0, numberValue(item.total_qty));
  const unitPrice = unitPriceFor(item, qty);
  const condition = stringValue(item.condition);

  return {
    uuid,
    name: stringValue(item.name, 'Product'),
    imageUrl: imageUrls(item.images)[0],
    brand: stringValue(recordFrom(item.brand).name) || undefined,
    condition: condition ? condition.charAt(0).toUpperCase() + condition.slice(1) : undefined,
    qty,
    moq,
    stock,
    unitPrice,
    lineTotal: round2(unitPrice * qty),
    shippingOptions: shippingOptionsFor(item.shipping_type),
    shippingCost: numberValue(row.shipping_cost),
    // Kept in the cart so the buyer can see and remove it, but it cannot be checked out.
    outOfStock: stock <= 0 || moq > stock,
  };
}

export function normalizeCart(payload: unknown): Cart {
  const rows = isRecord(payload) && Array.isArray(payload.data) ? payload.data : [];
  const items = rows.map(normalizeCartRow).filter((entry): entry is CartItem => entry !== null);
  const available = items.filter((entry) => !entry.outOfStock);

  return {
    items,
    subtotal: round2(available.reduce((sum, entry) => sum + entry.lineTotal, 0)),
    itemCount: items.length,
    hasOutOfStock: items.length > available.length,
  };
}

/** Reads the totals the server calculated; null when the response is not a usable calculation. */
export function parseTotals(payload: unknown): OrderTotals | null {
  const data = isRecord(payload) ? payload.data : undefined;
  if (!isRecord(data)) return null;

  const total = Number(data.total);
  if (!Number.isFinite(total) || total < 0) return null;

  return {
    shipping: round2(numberValue(data.shipping_cost)),
    tax: round2(numberValue(data.tax)),
    processingFee: round2(numberValue(data.strip_fee)),
    total: round2(total),
  };
}

/** FedEx packages carry `{ service: price }` rate maps; the cheapest service per response is first. */
export function parseFedexRates(payload: unknown): FedexRate[] {
  const data = isRecord(payload) ? recordFrom(payload.data) : {};
  const packages = Array.isArray(data.packages) ? data.packages : [];
  const rates: FedexRate[] = [];

  for (const entry of packages) {
    for (const [service, price] of Object.entries(recordFrom(recordFrom(entry).rates))) {
      const amount = Number(price);
      if (Number.isFinite(amount) && amount >= 0) rates.push({ service, price: round2(amount) });
    }
  }
  return rates;
}
