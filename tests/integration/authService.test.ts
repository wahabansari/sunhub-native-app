import { AppError } from '@/errors/AppError';
import type { ApiClient } from '@/services/api/client';
import { createAuthService } from '@/services/auth/authService';
import { createLogger } from '@/services/logging/logger';
import type { SessionStorage } from '@/services/storage/sessionStorage';
import type { StoredSession } from '@/types/auth';

function createStorage(initial: StoredSession | null = null) {
  let session = initial;

  const storage: SessionStorage = {
    read: jest.fn(async () => session),
    write: jest.fn(async (next: StoredSession) => {
      session = next;
    }),
    clear: jest.fn(async () => {
      session = null;
    }),
  };

  return { storage, getSession: () => session };
}

function createApi(...responses: unknown[]) {
  let index = 0;

  const request = jest.fn(async () => {
    const response = responses[index];
    index += 1;
    return response;
  });

  return { api: { request } as ApiClient, request };
}

const logger = createLogger('silent');

describe('auth service', () => {
  it('signs in, loads the profile, and stores the session', async () => {
    const { api, request } = createApi(
      {
        status: true,
        data: { auth: { access_token: 'token-123' }, role: ['seller'] },
      },
      {
        status: true,
        data: {
          status: 'active',
          email: 'person@example.test',
          firstname: 'Ada',
          lastname: 'Lovelace',
        },
      },
    );
    const { storage, getSession } = createStorage();
    const service = createAuthService({ api, storage, logger });

    const user = await service.signIn({
      email: 'person@example.test',
      password: 'secret',
    });

    expect(user).toEqual({
      email: 'person@example.test',
      firstName: 'Ada',
      lastName: 'Lovelace',
      profileStatus: 'active',
      roles: ['seller'],
    });
    expect(getSession()).toEqual({ accessToken: 'token-123', roles: ['seller'] });
    expect(request).toHaveBeenNthCalledWith(1, {
      method: 'POST',
      path: '/client/login',
      body: { email: 'person@example.test', password: 'secret' },
    });
    expect(request).toHaveBeenNthCalledWith(2, {
      method: 'GET',
      path: '/client/my-profile/edit',
      token: 'token-123',
    });
  });

  it('does not store a session when login is rejected', async () => {
    const { api } = createApi({ status: false, errors: ['Invalid credentials.'] });
    const { storage, getSession } = createStorage();
    const service = createAuthService({ api, storage, logger });

    await expect(
      service.signIn({ email: 'person@example.test', password: 'wrong' }),
    ).rejects.toMatchObject({ code: 'AUTH_FAILED', userMessage: 'Invalid credentials.' });

    expect(storage.write).not.toHaveBeenCalled();
    expect(getSession()).toBeNull();
  });

  it('rejects inactive accounts without storing a token', async () => {
    const { api } = createApi(
      {
        status: true,
        data: { auth: { access_token: 'token-123' }, role: ['customer'] },
      },
      { status: true, data: { status: 'inactive', email: 'person@example.test' } },
    );
    const { storage, getSession } = createStorage();
    const service = createAuthService({ api, storage, logger });

    await expect(
      service.signIn({ email: 'person@example.test', password: 'secret' }),
    ).rejects.toMatchObject({
      code: 'AUTH_INACTIVE',
      userMessage: 'This account is not active.',
    });

    expect(storage.write).not.toHaveBeenCalled();
    expect(getSession()).toBeNull();
  });

  it('restores a valid session and reuses cached roles', async () => {
    const { api } = createApi({
      status: true,
      data: {
        status: 'active',
        email: 'person@example.test',
        firstname: 'Ada',
        lastname: 'Lovelace',
      },
    });
    const { storage } = createStorage({ accessToken: 'token-123', roles: ['reseller'] });
    const service = createAuthService({ api, storage, logger });

    await expect(service.restoreSession()).resolves.toMatchObject({
      email: 'person@example.test',
      roles: ['reseller'],
    });
  });

  it('clears a session that the server no longer accepts', async () => {
    const { api } = createApi();
    (api.request as jest.Mock).mockRejectedValueOnce(
      new AppError('HTTP', 'unauthorized', { status: 401 }),
    );
    const { storage } = createStorage({ accessToken: 'expired', roles: [] });
    const service = createAuthService({ api, storage, logger });

    await expect(service.restoreSession()).resolves.toBeNull();
    expect(storage.clear).toHaveBeenCalledTimes(1);
  });

  it('clears the local session even when remote sign-out fails', async () => {
    const { api } = createApi();
    (api.request as jest.Mock).mockRejectedValueOnce(new AppError('NETWORK', 'offline'));
    const { storage, getSession } = createStorage({
      accessToken: 'token-123',
      roles: ['customer'],
    });
    const service = createAuthService({ api, storage, logger });

    await expect(service.signOut()).resolves.toBeUndefined();
    expect(storage.clear).toHaveBeenCalledTimes(1);
    expect(getSession()).toBeNull();
  });
});
