import { describe, expect, it, vi } from 'vitest';

import { AppError } from '@/errors/app-error';
import type { ApiClient } from '@/services/api/api-client';
import { createAuthService } from '@/services/auth/auth-service';
import type { SessionStorage } from '@/services/storage/session-storage';

const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };

function setup(request: ApiClient['request']) {
  const storage: SessionStorage = {
    read: vi.fn().mockResolvedValue(null),
    write: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  };
  const service = createAuthService({ api: { request } as ApiClient, storage, logger });
  return { service, storage };
}

const credentials = { email: 'jo@example.com', password: 'secret' };

describe('sign-in failures', () => {
  it('reports an unverified email with the server message', async () => {
    const { service, storage } = setup(
      vi.fn().mockRejectedValue(
        new AppError('HTTP', 'forbidden', {
          status: 403,
          serverMessages: ['Please verify your email first.'],
        }),
      ),
    );

    await expect(service.signIn(credentials)).rejects.toMatchObject({
      code: 'AUTH_UNVERIFIED',
      userMessage: 'Please verify your email first.',
    });
    expect(storage.write).not.toHaveBeenCalled();
  });

  it('falls back to a default message when the server gives none', async () => {
    const { service } = setup(
      vi.fn().mockRejectedValue(new AppError('HTTP', 'forbidden', { status: 403 })),
    );

    await expect(service.signIn(credentials)).rejects.toMatchObject({
      code: 'AUTH_UNVERIFIED',
      userMessage: 'Please verify your email address before signing in.',
    });
  });

  it.each([400, 401, 422])('maps HTTP %i to invalid credentials', async (status) => {
    const { service } = setup(
      vi.fn().mockRejectedValue(new AppError('HTTP', 'rejected', { status })),
    );

    await expect(service.signIn(credentials)).rejects.toMatchObject({
      code: 'AUTH_FAILED',
      userMessage: 'Unable to sign in. Check your email and password.',
    });
  });

  it('passes other failures through unchanged', async () => {
    const outage = new AppError('HTTP', 'down', { status: 503, userMessage: 'Server down' });
    const { service } = setup(vi.fn().mockRejectedValue(outage));

    await expect(service.signIn(credentials)).rejects.toBe(outage);
  });
});
