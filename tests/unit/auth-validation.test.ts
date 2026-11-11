import { describe, expect, it } from 'vitest';

import {
  hasFormErrors,
  validateForgotPasswordForm,
  validateRegisterForm,
  validateResetPasswordForm,
  validateSignInForm,
  type RegisterFormValues,
} from '@/validation/auth';

const validRegistration: RegisterFormValues = {
  role: 'customer',
  fullName: 'Jo Solar',
  companyName: '',
  email: 'jo@example.com',
  phone: '(555) 123-4567',
  password: 'secret-pass',
  passwordConfirmation: 'secret-pass',
  agreed: true,
};

describe('auth validation', () => {
  it('requires a valid email and a password to sign in', () => {
    expect(validateSignInForm({})).toEqual({
      email: 'Email is required.',
      password: 'Password is required.',
    });
    expect(validateSignInForm({ email: 'nope', password: 'x' })).toEqual({
      email: 'Enter a valid email address.',
    });
    expect(hasFormErrors(validateSignInForm({ email: 'a@b.co', password: 'x' }))).toBe(false);
  });

  it('accepts a complete registration', () => {
    expect(validateRegisterForm(validRegistration)).toEqual({});
  });

  it('flags every missing registration field', () => {
    const errors = validateRegisterForm({
      ...validRegistration,
      fullName: ' ',
      email: '',
      phone: '12',
      password: '',
      passwordConfirmation: '',
      agreed: false,
    });

    expect(Object.keys(errors).sort()).toEqual([
      'agreed',
      'email',
      'fullName',
      'password',
      'passwordConfirmation',
      'phone',
    ]);
  });

  it('checks the password confirmation and company name characters', () => {
    expect(
      validateRegisterForm({ ...validRegistration, passwordConfirmation: 'different' })
        .passwordConfirmation,
    ).toBe('The passwords do not match.');
    expect(validateRegisterForm({ ...validRegistration, companyName: 'Société' }).companyName).toBe(
      'Other languages are not allowed.',
    );
  });

  it('validates forgot and reset password forms', () => {
    expect(validateForgotPasswordForm({ email: '' })).toEqual({ email: 'Email is required.' });
    expect(validateForgotPasswordForm({ email: 'a@b.co' })).toEqual({});
    expect(validateResetPasswordForm({ password: 'a', passwordConfirmation: 'b' })).toEqual({
      passwordConfirmation: 'The passwords do not match.',
    });
    expect(validateResetPasswordForm({ password: 'a', passwordConfirmation: 'a' })).toEqual({});
  });
});
