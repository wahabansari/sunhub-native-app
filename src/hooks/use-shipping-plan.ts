import { useEffect, useRef, useState } from 'react';

import { toUserMessage } from '@/errors';
import { cartService, checkoutService } from '@/services/cart';
import { cartShippingValue } from '@/services/cart/cart-mappers';
import type { Cart, CartItem, FedexRate, ShippingAddress, ShippingChoice } from '@/types/cart';

export type ShippingPlanStatus = 'incomplete' | 'working' | 'ready' | 'error';

export interface ShippingPlan {
  /** What each item will use: the buyer's pick, or its only option. */
  choices: Record<string, ShippingChoice | undefined>;
  fedexRates: Record<string, FedexRate | undefined>;
  fedexCharges: number;
  status: ShippingPlanStatus;
  error: string | null;
  choose: (uuid: string, choice: ShippingChoice) => void;
}

type Applied = {
  key: string;
  charges: number;
  rates: Record<string, FedexRate | undefined>;
};

function chosenFor(
  item: CartItem,
  picks: Record<string, ShippingChoice>,
): ShippingChoice | undefined {
  return (
    picks[item.uuid] ?? (item.shippingOptions.length === 1 ? item.shippingOptions[0] : undefined)
  );
}

function pickRate(rates: FedexRate[]): FedexRate | undefined {
  return rates.find((rate) => rate.service === 'FEDEX_GROUND') ?? rates[0];
}

/**
 * Keeps the server cart in step with the buyer's delivery choices. The server prices shipping from
 * what is stored on each cart row, so every choice (and every FedEx quote) is written there before
 * totals are calculated or an order is placed.
 */
export function useShippingPlan(
  cart: Cart | undefined,
  address: ShippingAddress | null,
): ShippingPlan {
  const [picks, setPicks] = useState<Record<string, ShippingChoice>>({});
  const [applied, setApplied] = useState<Applied | null>(null);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const run = useRef(0);

  const items = (cart?.items ?? []).filter((item) => !item.outOfStock);
  const choices = Object.fromEntries(items.map((item) => [item.uuid, chosenFor(item, picks)]));
  const usesFedex = items.some((item) => choices[item.uuid] === 'FEDEX');
  const addressKey = address
    ? `${address.address}|${address.city}|${address.state}|${address.zip}`
    : '';
  const complete =
    items.length > 0 &&
    items.every((item) => choices[item.uuid]) &&
    (!usesFedex || address !== null);
  const key = complete
    ? items.map((item) => `${item.uuid}:${item.qty}:${choices[item.uuid]}`).join(',') +
      (usesFedex ? `@${addressKey}` : '')
    : '';

  useEffect(() => {
    if (!key) return undefined;
    const id = ++run.current;

    (async () => {
      let charges = 0;
      const rates: Record<string, FedexRate | undefined> = {};

      for (const item of items) {
        const choice = choices[item.uuid];
        if (!choice) return;
        let shippingType = cartShippingValue(choice);

        if (choice === 'FEDEX' && address) {
          const rate = pickRate(
            await checkoutService.fedexRates(address, { [item.uuid]: item.qty }),
          );
          if (!rate) throw new Error('No FedEx rates are available for this address.');
          rates[item.uuid] = rate;
          charges += rate.price;
          shippingType = rate.service;
        }
        await cartService.setShipping(item.uuid, item.qty, shippingType);
      }
      if (id === run.current) setApplied({ key, charges, rates });
    })().catch((error: unknown) => {
      if (id === run.current) setFailure({ key, message: toUserMessage(error) });
    });

    return () => {
      run.current += 1;
    };
    // `items`, `choices` and `address` are all captured by `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const status: ShippingPlanStatus = !key
    ? 'incomplete'
    : failure?.key === key
      ? 'error'
      : applied?.key === key
        ? 'ready'
        : 'working';

  return {
    choices,
    fedexRates: applied?.key === key ? applied.rates : {},
    fedexCharges: applied?.key === key ? applied.charges : 0,
    status,
    error: failure?.key === key ? failure.message : null,
    choose: (uuid, choice) => setPicks((previous) => ({ ...previous, [uuid]: choice })),
  };
}
