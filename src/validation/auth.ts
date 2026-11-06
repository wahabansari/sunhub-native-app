import { isNonEmpty, isValidEmail } from '@/utils/validation';

export interface SignInFormValues {
  email?: string;
  password?: string;
}

export interface SignInFormErrors {
  email?: string;
  password?: string;
}

export function validateSignInForm(values: SignInFormValues): SignInFormErrors {
  const errors: SignInFormErrors = {};
  const email = values.email?.trim() ?? '';
  const password = values.password ?? '';

  if (!isNonEmpty(email)) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!isNonEmpty(password)) {
    errors.password = 'Password is required.';
  }

  return errors;
}

export function hasFormErrors(errors: SignInFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
