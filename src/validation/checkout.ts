import { US_STATE_NAMES } from '@/constants/us-states';
import type { GuestContact, ShippingAddress } from '@/types/cart';
import { isNonEmpty, isValidEmail, isValidUsPhone, isValidZipCode } from '@/utils/validation';

import type { FormErrors } from './auth';

const PRINTABLE_ASCII = /^[\x20-\x7E]+$/;

export type AddressErrors = FormErrors<'address' | 'city' | 'state' | 'zip'>;
export type ContactErrors = FormErrors<'firstName' | 'lastName' | 'email' | 'phone'>;
export type BillingErrors = AddressErrors & FormErrors<'holder'>;

export function isUsStateCode(value: string): boolean {
  return Object.prototype.hasOwnProperty.call(US_STATE_NAMES, value.trim().toUpperCase());
}

export function validateAddress(values: ShippingAddress): AddressErrors {
  const errors: AddressErrors = {};

  if (!isNonEmpty(values.address) || values.address.trim().length < 3) {
    errors.address = 'Enter your street address.';
  } else if (!PRINTABLE_ASCII.test(values.address)) {
    errors.address = 'Use English letters and numbers only.';
  }
  if (!isNonEmpty(values.city)) errors.city = 'Enter your city.';
  if (!isUsStateCode(values.state)) errors.state = 'Choose a state.';
  if (!isValidZipCode(values.zip)) errors.zip = 'Enter a 5-digit ZIP code.';

  return errors;
}

export function validateContact(values: GuestContact): ContactErrors {
  const errors: ContactErrors = {};

  if (!isNonEmpty(values.firstName)) errors.firstName = 'First name is required.';
  if (!isNonEmpty(values.lastName)) errors.lastName = 'Last name is required.';
  if (!isNonEmpty(values.email)) errors.email = 'Email is required.';
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address.';
  if (!isNonEmpty(values.phone)) errors.phone = 'Phone number is required.';
  else if (!isValidUsPhone(values.phone)) errors.phone = 'Enter a valid 10-digit phone number.';

  return errors;
}

export function validateBilling(values: ShippingAddress & { holder: string }): BillingErrors {
  const errors: BillingErrors = validateAddress(values);
  if (!isNonEmpty(values.holder)) errors.holder = 'Enter the name on the card.';
  return errors;
}

/** True when a shipping address is complete enough to price tax and FedEx rates. */
export function isCompleteAddress(values: ShippingAddress): boolean {
  return Object.keys(validateAddress(values)).length === 0;
}
