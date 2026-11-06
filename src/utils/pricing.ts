export interface DealPriceInput {
  sunhub_price?: unknown;
  seller_price?: unknown;
  price?: unknown;
  msrp?: unknown;
  startDate?: unknown;
  start_date?: unknown;
  endDate?: unknown;
  end_date?: unknown;
  status?: string;
}

export interface DealDisplayPrices {
  sellingPrice: number | null;
  strikeThroughPrice: number | null;
  showDiscount: boolean;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toStartOfDay(value: unknown): Date | null {
  if (typeof value !== 'string' && !(value instanceof Date)) {
    return null;
  }

  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Resolves the effective selling price and strike-through MSRP for a deal.
 *
 * Ported from the web reference app so web and mobile can present the same
 * promotion window consistently.
 */
export function getDealDisplayPrices(
  deal: DealPriceInput | null | undefined,
  now: Date = new Date(),
): DealDisplayPrices {
  if (!deal) {
    return { sellingPrice: null, strikeThroughPrice: null, showDiscount: false };
  }

  const rawSellingPrice =
    deal.sunhub_price !== null && deal.sunhub_price !== undefined && deal.sunhub_price !== ''
      ? deal.sunhub_price
      : deal.seller_price !== null && deal.seller_price !== undefined && deal.seller_price !== ''
        ? deal.seller_price
        : deal.price;

  const sellingPrice = toNumber(rawSellingPrice);
  const storedMsrp = toNumber(deal.msrp);
  const startDate = toStartOfDay(deal.startDate ?? deal.start_date);
  const endDate = toStartOfDay(deal.endDate ?? deal.end_date);
  const today = startOfDay(now);

  if (endDate && today.getTime() >= endDate.getTime()) {
    const displayPrice = storedMsrp !== null && storedMsrp > 0 ? storedMsrp : sellingPrice;

    return {
      sellingPrice: displayPrice,
      strikeThroughPrice: null,
      showDiscount: false,
    };
  }

  if (startDate && today.getTime() < startDate.getTime()) {
    return {
      sellingPrice,
      strikeThroughPrice: null,
      showDiscount: false,
    };
  }

  const hasPromotionDates = Boolean(startDate || endDate);
  const inActiveWindow =
    !hasPromotionDates ||
    (startDate !== null && endDate === null && today.getTime() >= startDate.getTime()) ||
    (startDate !== null &&
      endDate !== null &&
      today.getTime() >= startDate.getTime() &&
      today.getTime() < endDate.getTime());

  const showDiscount = Boolean(
    inActiveWindow &&
    storedMsrp !== null &&
    sellingPrice !== null &&
    storedMsrp > 0 &&
    sellingPrice > 0 &&
    storedMsrp > sellingPrice,
  );

  if (showDiscount) {
    return {
      sellingPrice,
      strikeThroughPrice: storedMsrp,
      showDiscount: true,
    };
  }

  return {
    sellingPrice,
    strikeThroughPrice: null,
    showDiscount: false,
  };
}

export function shouldShowDealMsrpDiscount(deal: DealPriceInput | null | undefined): boolean {
  if (!deal || deal.status === 'Pending') {
    return false;
  }

  return getDealDisplayPrices(deal).showDiscount;
}

export function getDealMsrpDiscountPercent(deal: DealPriceInput | null | undefined): number {
  const { sellingPrice, strikeThroughPrice, showDiscount } = getDealDisplayPrices(deal);

  if (!showDiscount || !strikeThroughPrice || sellingPrice === null) {
    return 0;
  }

  const displayedStrike = Number(strikeThroughPrice.toFixed(4));
  const displayedSelling = Number(sellingPrice.toFixed(4));

  if (!(displayedStrike > 0)) {
    return 0;
  }

  return ((displayedStrike - displayedSelling) / displayedStrike) * 100;
}
