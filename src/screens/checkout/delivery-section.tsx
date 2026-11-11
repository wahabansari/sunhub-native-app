import { Text } from 'react-native';

import { OrderSummary } from '@/components/checkout/order-summary';
import { ShippingOptions } from '@/components/checkout/shipping-options';
import { FormBanner } from '@/components/forms/form-banner';
import type { useCheckoutPricing } from '@/hooks/use-checkout-pricing';
import type { Cart } from '@/types/cart';

import { Section } from './checkout-frame';

type Props = {
  cart: Cart;
  pricing: ReturnType<typeof useCheckoutPricing>;
  hasAddress: boolean;
};

/** Delivery choices per item, followed by the order summary the server calculated. */
export function DeliverySection({ cart, pricing, hasAddress }: Props) {
  const { plan, totals } = pricing;
  const items = cart.items.filter((item) => !item.outOfStock);

  return (
    <>
      <Section title="Delivery">
        <ShippingOptions
          items={items}
          choices={plan.choices}
          fedexRates={plan.fedexRates}
          hasAddress={hasAddress}
          onChoose={plan.choose}
        />
        {plan.status === 'error' && plan.error ? (
          <FormBanner tone="error" message={plan.error} />
        ) : null}
        {plan.status === 'incomplete' ? (
          <Text className="font-inter text-[12.5px] text-muted">
            Choose how each item is delivered to see your total.
          </Text>
        ) : null}
      </Section>
      <Section title="Order summary">
        <OrderSummary
          subtotal={cart.subtotal}
          totals={totals.totals}
          isCalculating={totals.isCalculating || plan.status === 'working'}
          hasAddress={hasAddress}
          error={totals.error}
          onRetry={totals.retry}
        />
      </Section>
    </>
  );
}
