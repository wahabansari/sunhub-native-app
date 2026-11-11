import type { RegistrationRole } from '@/types/auth';
import { isNonEmpty, isValidEmail, isValidUsPhone } from '@/utils/validation';

export type FormErrors<Field extends string> = Partial<Record<Field, string>>;

export interface SignInFormValues {
  email?: string;
  password?: string;
}

export type SignInFormErrors = FormErrors<'email' | 'password'>;

const PRINTABLE_ASCII = /^[\x20-\x7E]*$/;

function validateEmail(value: string | undefined): string | undefined {
  const email = value?.trim() ?? '';

  if (!isNonEmpty(email)) return 'Email is required.';
  if (!isValidEmail(email)) return 'Enter a valid email address.';
  return undefined;
}

function validateNewPassword(password: string, confirmation: string) {
  const errors: FormErrors<'password' | 'passwordConfirmation'> = {};

  if (!isNonEmpty(password)) errors.password = 'Password is required.';
  if (!isNonEmpty(confirmation)) errors.passwordConfirmation = 'Please confirm your password.';
  else if (password !== confirmation) errors.passwordConfirmation = 'The passwords do not match.';

  return errors;
}

export function validateSignInForm(values: SignInFormValues): SignInFormErrors {
  const errors: SignInFormErrors = {};
  const emailError = validateEmail(values.email);

  if (emailError) errors.email = emailError;
  if (!isNonEmpty(values.password)) errors.password = 'Password is required.';

  return errors;
}

export interface RegisterFormValues {
  role: RegistrationRole;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
  agreed: boolean;
}

export type RegisterFormErrors = FormErrors<
  'fullName' | 'companyName' | 'email' | 'phone' | 'password' | 'passwordConfirmation' | 'agreed'
>;

export function validateRegisterForm(values: RegisterFormValues): RegisterFormErrors {
  const errors: RegisterFormErrors = {
    ...validateNewPassword(values.password, values.passwordConfirmation),
  };
  const emailError = validateEmail(values.email);

  if (!isNonEmpty(values.fullName)) errors.fullName = 'Full name is required.';
  if (emailError) errors.email = emailError;
  if (!isNonEmpty(values.phone)) errors.phone = 'Phone number is required.';
  else if (!isValidUsPhone(values.phone)) errors.phone = 'Enter a valid 10-digit phone number.';
  if (!PRINTABLE_ASCII.test(values.companyName)) {
    errors.companyName = 'Other languages are not allowed.';
  }
  if (!values.agreed) errors.agreed = 'Please accept the terms to continue.';

  return errors;
}

export type ForgotPasswordErrors = FormErrors<'email'>;

export function validateForgotPasswordForm(values: { email?: string }): ForgotPasswordErrors {
  const emailError = validateEmail(values.email);
  return emailError ? { email: emailError } : {};
}

export type ResetPasswordErrors = FormErrors<'password' | 'passwordConfirmation'>;

export function validateResetPasswordForm(values: {
  password: string;
  passwordConfirmation: string;
}): ResetPasswordErrors {
  return validateNewPassword(values.password, values.passwordConfirmation);
}

export function hasFormErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
