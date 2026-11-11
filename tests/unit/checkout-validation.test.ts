import { describe, expect, it } from 'vitest';

import { parseEnv } from '@/config/env-schema';
import {
  isCompleteAddress,
  isUsStateCode,
  validateAddress,
  validateBilling,
  validateContact,
} from '@/validation/checkout';

const address = { address: '100 Congress Ave', city: 'Austin', state: 'TX', zip: '78701' };

describe('checkout validation', () => {
  it('accepts a complete US address and rejects each bad part', () => {
    expect(validateAddress(address)).toEqual({});
    expect(isCompleteAddress(address)).toBe(true);
    expect(validateAddress({ address: 'ab', city: '', state: 'ZZ', zip: '1234' })).toEqual({
      address: 'Enter your street address.',
      city: 'Enter your city.',
      state: 'Choose a state.',
      zip: 'Enter a 5-digit ZIP code.',
    });
    expect(validateAddress({ ...address, address: 'Rue de l’Église 5' }).address).toBe(
      'Use English letters and numbers only.',
    );
  });

  it('recognises state codes regardless of case', () => {
    expect(isUsStateCode('tx')).toBe(true);
    expect(isUsStateCode('Texas')).toBe(false);
    expect(isUsStateCode('constructor')).toBe(false);
  });

  it('validates the guest contact', () => {
    expect(
      validateContact({
        firstName: 'Jo',
        lastName: 'S',
        email: 'jo@example.com',
        phone: '(555) 123-4567',
      }),
    ).toEqual({});
    expect(validateContact({ firstName: '', lastName: ' ', email: 'nope', phone: '123' })).toEqual({
      firstName: 'First name is required.',
      lastName: 'Last name is required.',
      email: 'Enter a valid email address.',
      phone: 'Enter a valid 10-digit phone number.',
    });
  });

  it('requires the name on the card for billing', () => {
    expect(validateBilling({ ...address, holder: '' }).holder).toBe('Enter the name on the card.');
    expect(validateBilling({ ...address, holder: 'Jo Solar' })).toEqual({});
  });
});

describe('Stripe key config', () => {
  const base = { apiBaseUrl: 'https://api.example.com' };

  it('accepts publishable keys and an empty value', () => {
    expect(parseEnv({ ...base, stripePublishableKey: 'pk_test_abc123' }).stripePublishableKey).toBe(
      'pk_test_abc123',
    );
    expect(parseEnv(base).stripePublishableKey).toBe('');
  });

  it('refuses a secret key, which would be public inside the app bundle', () => {
    expect(() => parseEnv({ ...base, stripePublishableKey: 'sk_live_abc123' })).toThrow(
      /publishable key/,
    );
    expect(() => parseEnv({ ...base, stripePublishableKey: 'rk_live_abc123' })).toThrow();
  });
});
