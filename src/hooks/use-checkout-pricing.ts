import type { Cart, ShippingAddress } from '@/types/cart';

import { useCheckoutTotals } from './use-checkout-totals';
import { usePlaceOrder } from './use-place-order';
import { useShippingPlan } from './use-shipping-plan';

/** True when two addresses are the same once surrounding spaces are ignored. */
export function sameAddress(a: ShippingAddress | null, b: ShippingAddress): boolean {
  return (
    a !== null &&
    a.address.trim() === b.address.trim() &&
    a.city.trim() === b.city.trim() &&
    a.state === b.state &&
    a.zip === b.zip
  );
}

/**
 * Everything a checkout screen needs to show and charge the right amount: delivery choices written
 * to the server cart, the server's totals for them, and the guarded place-order action.
 */
export function useCheckoutPricing(cart: Cart, address: ShippingAddress | null) {
  const plan = useShippingPlan(cart, address);
  const input = { productTotal: cart.subtotal, address, fedexCharges: plan.fedexCharges };
  const totals = useCheckoutTotals(input, plan.status === 'ready');
  const order = usePlaceOrder(input, totals.totals?.total);

  return {
    plan,
    totals,
    order,
    /** Delivery is saved and the server has priced it; nothing is mid-calculation. */
    isPriced: plan.status === 'ready' && totals.totals !== undefined && !totals.isCalculating,
  };
}
