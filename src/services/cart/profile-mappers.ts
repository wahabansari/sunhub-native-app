import { idValue, isRecord, stringValue } from '@/services/catalog/catalog-normalizers';
import type { SavedAddress, SavedCard } from '@/types/cart';

function listFrom(payload: unknown): unknown[] {
  return isRecord(payload) && Array.isArray(payload.data) ? payload.data : [];
}

/** Saved shipping addresses; rows without an id or street are dropped because they cannot be used. */
export function parseSavedAddresses(payload: unknown): SavedAddress[] {
  const addresses: SavedAddress[] = [];

  for (const row of listFrom(payload)) {
    if (!isRecord(row)) continue;
    const id = idValue(row.id, '');
    const address = stringValue(row.address1);
    if (!id || !address) continue;

    addresses.push({
      id,
      name: stringValue(row.name),
      address,
      city: stringValue(row.city),
      state: stringValue(row.state).toUpperCase(),
      zip: stringValue(row.zip),
      phone: stringValue(row.number) || undefined,
    });
  }
  return addresses;
}

/** Saved cards as display-only records. */
export function parseSavedCards(payload: unknown): SavedCard[] {
  const cards: SavedCard[] = [];

  for (const row of listFrom(payload)) {
    if (!isRecord(row)) continue;
    const id = idValue(row.id, '');
    const last4 = stringValue(row.last_4);
    if (!id || !last4) continue;

    cards.push({
      id,
      brand: stringValue(row.brand, 'Card'),
      last4,
      expiration: stringValue(row.expiration_date),
      holder: [stringValue(row.billing_first_name), stringValue(row.billing_last_name)]
        .filter(Boolean)
        .join(' '),
      billingSummary: [row.billing_address, row.billing_city, row.billing_state, row.billing_zip]
        .map((part) => stringValue(part))
        .filter(Boolean)
        .join(', '),
    });
  }
  return cards;
}
