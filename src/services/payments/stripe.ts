import { env } from '@/config/env';
import { logger } from '@/services/logging';

type StripeModule = typeof import('@stripe/stripe-react-native');

let cached: StripeModule | null | undefined;

/**
 * Stripe's SDK is native code. Loading it lazily and inside a try/catch means a runtime that does
 * not include it (for example an Expo Go build without Stripe) only loses card entry; the rest of
 * the app still starts.
 */
export function getStripe(): StripeModule | null {
  if (cached !== undefined) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('@stripe/stripe-react-native') as StripeModule;
  } catch (error) {
    cached = null;
    logger.warn('Stripe is not available in this runtime', {
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
  return cached;
}

/** True when a publishable key is configured and Stripe's native module is present. */
export function isCardEntryAvailable(): boolean {
  return Boolean(env.stripePublishableKey) && getStripe() !== null;
}
