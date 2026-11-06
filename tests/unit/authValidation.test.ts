import { hasFormErrors, validateSignInForm } from '@/validation/auth';

describe('validateSignInForm', () => {
  it('requires email and password', () => {
    expect(validateSignInForm({})).toEqual({
      email: 'Email is required.',
      password: 'Password is required.',
    });
  });

  it('rejects an invalid email and whitespace password', () => {
    expect(validateSignInForm({ email: 'nope', password: '   ' })).toEqual({
      email: 'Enter a valid email address.',
      password: 'Password is required.',
    });
  });

  it('accepts valid values', () => {
    const errors = validateSignInForm({ email: 'person@example.test', password: 'secret' });
    expect(errors).toEqual({});
    expect(hasFormErrors(errors)).toBe(false);
  });

  it('reports whether errors exist', () => {
    expect(hasFormErrors({ email: 'Required.' })).toBe(true);
  });
});
