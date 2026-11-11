import { describe, expect, it, vi } from 'vitest';

import { AppError } from '@/errors/app-error';
import type { ApiClient } from '@/services/api/api-client';
import { createAccountService } from '@/services/auth/account-service';

const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };

function serviceWith(request: ApiClient['request']) {
  return createAccountService({ api: { request } as ApiClient, logger });
}

const registration = {
  role: 'seller' as const,
  fullName: ' Jo Solar ',
  companyName: ' Sun Co ',
  email: ' jo@example.com ',
  phone: '(555) 123-4567',
  password: 'secret-pass',
  passwordConfirmation: 'secret-pass',
};

describe('account service', () => {
  it('posts the web signup contract with digits-only phone', async () => {
    const request = vi.fn().mockResolvedValue({ status: true });

    await serviceWith(request).register(registration);

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      path: '/client/signup',
      body: {
        role: 'seller',
        firstname: 'Jo Solar',
        companyname: 'Sun Co',
        email: 'jo@example.com',
        phone: '5551234567',
        password: 'secret-pass',
        password_confirmation: 'secret-pass',
        agreement: true,
      },
      token: undefined,
    });
  });

  it('omits an empty company name', async () => {
    const request = vi.fn().mockResolvedValue({ status: true });

    await serviceWith(request).register({ ...registration, role: 'customer', companyName: '' });

    expect(request.mock.calls[0][0].body).not.toHaveProperty('companyname');
  });

  it('turns a status=false response into a form error with field messages', async () => {
    const request = vi.fn().mockResolvedValue({
      status: false,
      errors: { email: ['The email has already been taken.'] },
    });

    await expect(serviceWith(request).register(registration)).rejects.toMatchObject({
      code: 'ACCOUNT_REQUEST_FAILED',
      userMessage: 'The email has already been taken.',
      fieldErrors: { email: 'The email has already been taken.' },
    });
  });

  it('uses server messages from rejected 4xx responses and a fallback otherwise', async () => {
    const rejected = vi
      .fn()
      .mockRejectedValue(
        new AppError('HTTP', 'failed', { status: 422, serverMessages: ['Invalid email'] }),
      );
    await expect(serviceWith(rejected).requestPasswordReset('x')).rejects.toMatchObject({
      userMessage: 'Invalid email',
    });

    const silent = vi.fn().mockRejectedValue(new AppError('HTTP', 'failed', { status: 404 }));
    await expect(serviceWith(silent).requestPasswordReset('x')).rejects.toMatchObject({
      userMessage: 'We could not send the reset email. Please try again.',
    });
  });

  it('does not rewrite network or server failures', async () => {
    const network = new AppError('NETWORK', 'offline', { userMessage: 'Offline' });
    const request = vi.fn().mockRejectedValue(network);

    await expect(serviceWith(request).requestPasswordReset('a@b.co')).rejects.toBe(network);
  });

  it('sends the reset token in the body and as a bearer header', async () => {
    const request = vi.fn().mockResolvedValue({ status: true, message: 'ok' });

    await serviceWith(request).resetPassword({
      email: 'a@b.co',
      token: 'tok',
      password: 'p',
      passwordConfirmation: 'p',
    });

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/client/password/reset',
        token: 'tok',
        body: { email: 'a@b.co', token: 'tok', password: 'p', password_confirmation: 'p' },
      }),
    );
  });

  it('posts email and password to resend the verification email', async () => {
    const request = vi.fn().mockResolvedValue({ status: true });

    await serviceWith(request).resendVerification({ email: ' a@b.co ', password: 'p' });

    expect(request.mock.calls[0][0]).toMatchObject({
      path: '/client/email/resend',
      body: { email: 'a@b.co', password: 'p' },
    });
  });
});
