import { describe, expect, it } from 'vitest';

import { formatUsPhone, parseResetLink, safeRedirect } from '@/utils/auth-links';

describe('formatUsPhone', () => {
  it('formats progressively and ignores extra characters', () => {
    expect(formatUsPhone('')).toBe('');
    expect(formatUsPhone('5')).toBe('(5');
    expect(formatUsPhone('555123')).toBe('(555) 123');
    expect(formatUsPhone('55512345678999')).toBe('(555) 123-4567');
    expect(formatUsPhone('(555) 123-4567')).toBe('(555) 123-4567');
  });
});

describe('safeRedirect', () => {
  it('accepts in-app paths only', () => {
    expect(safeRedirect('/products/abc-123')).toBe('/products/abc-123');
    expect(safeRedirect('/deals?state=CA')).toBe('/deals?state=CA');
    expect(safeRedirect(['/shop'])).toBe('/shop');
  });

  it('rejects external, protocol-relative and scripted targets', () => {
    expect(safeRedirect('https://evil.example')).toBeNull();
    expect(safeRedirect('//evil.example')).toBeNull();
    expect(safeRedirect('javascript:alert(1)')).toBeNull();
    expect(safeRedirect(undefined)).toBeNull();
  });

  it('never loops back into the auth screens', () => {
    expect(safeRedirect('/login')).toBeNull();
    expect(safeRedirect('/register')).toBeNull();
    expect(safeRedirect('/reset-password?x=1')).toBeNull();
  });
});

describe('parseResetLink', () => {
  it('reads the email and token from a Sunhub web link', () => {
    expect(
      parseResetLink('https://www.sunhub.com/password/reset?token=abc123&email=jo%40example.com'),
    ).toEqual({ email: 'jo@example.com', token: 'abc123' });
  });

  it('keeps a plus sign in the email', () => {
    expect(
      parseResetLink('https://sunhub.com/password/reset?email=jo+tag@example.com&token=t'),
    ).toEqual({ email: 'jo+tag@example.com', token: 't' });
  });

  it('accepts the app deep link', () => {
    expect(parseResetLink('sunhub://reset-password?email=a%40b.co&token=zz')).toEqual({
      email: 'a@b.co',
      token: 'zz',
    });
  });

  it('rejects other hosts and incomplete links', () => {
    expect(parseResetLink('https://evil.example/reset?email=a@b.co&token=t')).toBeNull();
    expect(parseResetLink('https://notsunhub.com/reset?email=a@b.co&token=t')).toBeNull();
    expect(parseResetLink('https://www.sunhub.com/password/reset?email=a@b.co')).toBeNull();
    expect(parseResetLink('not a link')).toBeNull();
  });
});
