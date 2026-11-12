import { useCallback } from 'react';

import { AppError } from '@/errors/app-error';
import type { CardToken } from '@/services/cart';
import { getStripe } from '@/services/payments/stripe';

/**
 * Turns the card typed into Stripe's native `CardField` into a single-use token. The number,
 * expiry and CVC never enter JavaScript: Stripe reads them natively and returns only the token
 * id and the card's last four digits and expiry, which is all the Sunhub API receives.
 */
export function useCardTokenizer() {
  return useCallback(async (holderName: string): Promise<CardToken> => {
    const stripe = getStripe();
    if (!stripe) {
      throw new AppError('CHECKOUT_FAILED', 'Stripe is not available', {
        userMessage: 'Card payments are not available in this version of the app.',
      });
    }
    const { token, error } = await stripe.createToken({ type: 'Card', name: holderName.trim() });

    if (error || !token?.card) {
      throw new AppError('CHECKOUT_FAILED', 'Card tokenisation failed', {
        // Stripe's message is written for cardholders (e.g. "Your card number is incorrect").
        userMessage:
          error?.message || 'We could not read that card. Check the details and try again.',
      });
    }

    return {
      id: token.id,
      last4: token.card.last4,
      expMonth: token.card.expMonth,
      expYear: token.card.expYear,
    };
  }, []);
}
