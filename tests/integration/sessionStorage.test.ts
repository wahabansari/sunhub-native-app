import { AUTH_SESSION_KEY } from '@/constants/storage';
import { createSessionStorage } from '@/services/storage/sessionStorage';

interface SecureStoreMock {
  __reset(): void;
  __set(key: string, value: string): void;
  __get(key: string): string | null;
  getItemAsync: jest.Mock;
}

const secureStore = jest.requireMock('expo-secure-store') as SecureStoreMock;

describe('session storage', () => {
  const storage = createSessionStorage();

  beforeEach(() => {
    secureStore.__reset();
  });

  it('round-trips a session and clears it', async () => {
    const session = { accessToken: 'token-123', roles: ['seller'] };

    await storage.write(session);

    expect(secureStore.__get(AUTH_SESSION_KEY)).toBe(JSON.stringify(session));
    await expect(storage.read()).resolves.toEqual(session);

    await storage.clear();
    await expect(storage.read()).resolves.toBeNull();
  });

  it('treats corrupt values as signed out and cleans them up', async () => {
    secureStore.__set(AUTH_SESSION_KEY, '{not-json');

    await expect(storage.read()).resolves.toBeNull();
    expect(secureStore.__get(AUTH_SESSION_KEY)).toBeNull();
  });

  it('rejects a stored value without an access token', async () => {
    secureStore.__set(AUTH_SESSION_KEY, JSON.stringify({ roles: ['seller'] }));

    await expect(storage.read()).resolves.toBeNull();
    expect(secureStore.__get(AUTH_SESSION_KEY)).toBeNull();
  });

  it('maps native storage failures to a safe app error', async () => {
    secureStore.getItemAsync.mockRejectedValueOnce(new Error('native failure'));

    await expect(storage.read()).rejects.toMatchObject({
      code: 'STORAGE',
      userMessage: 'Unable to access secure storage on this device.',
    });
  });
});
