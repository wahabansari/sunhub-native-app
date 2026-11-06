import type { AuthService, AuthUser, SignInCredentials } from '@/types/auth';

export function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    email: 'tester@example.test',
    firstName: 'Test',
    lastName: 'User',
    profileStatus: 'active',
    roles: ['customer'],
    ...overrides,
  };
}

export function createFakeAuthService(
  overrides: Partial<AuthService> = {},
): jest.Mocked<AuthService> {
  return {
    restoreSession: jest.fn(async (): Promise<AuthUser | null> => null),
    signIn: jest.fn(async (_credentials: SignInCredentials) => makeUser()),
    signOut: jest.fn(async (): Promise<void> => undefined),
    ...overrides,
  } as unknown as jest.Mocked<AuthService>;
}
