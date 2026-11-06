import {
  isActiveProfile,
  makeAuthUser,
  parseLoginResponse,
  parseProfileResponse,
} from '@/services/auth/authMappers';

describe('auth mappers', () => {
  it('parses a login response', () => {
    expect(
      parseLoginResponse({
        status: true,
        data: {
          auth: { access_token: 'token-123' },
          role: ['seller', 'customer'],
        },
      }),
    ).toEqual({ accessToken: 'token-123', roles: ['seller', 'customer'] });
  });

  it('surfaces login errors safely', () => {
    expect(() =>
      parseLoginResponse({ status: false, errors: ['Invalid credentials.', 'Try again.'] }),
    ).toThrow(
      expect.objectContaining({
        code: 'AUTH_FAILED',
        userMessage: 'Invalid credentials.',
      }),
    );
  });

  it('rejects a login response without a token', () => {
    expect(() => parseLoginResponse({ status: true, data: {} })).toThrow(
      expect.objectContaining({ code: 'AUTH_INVALID_RESPONSE' }),
    );
  });

  it('parses profile names from either casing and keeps roles', () => {
    expect(
      parseProfileResponse({
        status: true,
        data: {
          status: 'active',
          email: 'person@example.test',
          first_name: 'Ada',
          lastname: 'Lovelace',
          role: ['seller'],
        },
      }),
    ).toEqual({
      profileStatus: 'active',
      email: 'person@example.test',
      firstName: 'Ada',
      lastName: 'Lovelace',
      roles: ['seller'],
    });
  });

  it('surfaces profile errors', () => {
    expect(() => parseProfileResponse({ status: false, message: 'Profile unavailable.' })).toThrow(
      expect.objectContaining({ code: 'AUTH_FAILED' }),
    );
  });

  it('detects active profiles and merges roles', () => {
    expect(isActiveProfile(' ACTIVE ')).toBe(true);
    expect(isActiveProfile('inactive')).toBe(false);

    const profile = {
      profileStatus: 'active',
      email: 'person@example.test',
      firstName: 'Ada',
      lastName: 'Lovelace',
      roles: ['customer'],
    };

    expect(makeAuthUser(profile, ['seller']).roles).toEqual(['seller']);
    expect(makeAuthUser(profile, []).roles).toEqual(['customer']);
  });
});
