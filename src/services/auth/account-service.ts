import { AUTH_ENDPOINTS } from '@/constants/api';
import { AppError, isAppError } from '@/errors/app-error';
import type { ApiClient } from '@/services/api/api-client';
import { parseServerErrors } from '@/services/api/error-payload';
import type { Logger } from '@/services/logging/logger';
import type {
  AccountService,
  RegisterInput,
  ResetPasswordInput,
  SignInCredentials,
} from '@/types/auth';

export interface AccountServiceDependencies {
  api: ApiClient;
  logger: Logger;
}

function isRejectedPayload(payload: unknown): boolean {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'status' in payload &&
    (payload as { status?: unknown }).status === false
  );
}

function rejection(
  message: string,
  fallback: string,
  details: { status?: number; messages: string[]; fields: Record<string, string> },
): AppError {
  return new AppError('ACCOUNT_REQUEST_FAILED', message, {
    status: details.status,
    userMessage: details.messages[0] ?? fallback,
    serverMessages: details.messages,
    fieldErrors: details.fields,
  });
}

/** Mobile-native versions of the web register, forgot/reset password and resend-verification calls. */
export function createAccountService({ api, logger }: AccountServiceDependencies): AccountService {
  async function post(path: string, body: unknown, fallback: string, token?: string) {
    let payload: unknown;

    try {
      payload = await api.request<unknown>({ method: 'POST', path, body, token });
    } catch (error) {
      if (isAppError(error) && error.status !== undefined && error.status < 500) {
        throw rejection('Account request was rejected', fallback, {
          status: error.status,
          messages: error.serverMessages,
          fields: error.fieldErrors,
        });
      }
      throw error;
    }

    if (isRejectedPayload(payload)) {
      const server = parseServerErrors(payload);
      throw rejection('Account request returned status=false', fallback, {
        messages: server.messages,
        fields: server.fields,
      });
    }
  }

  return {
    async register(input: RegisterInput): Promise<void> {
      const companyName = input.companyName?.trim();

      await post(
        AUTH_ENDPOINTS.register,
        {
          role: input.role,
          firstname: input.fullName.trim(),
          ...(companyName ? { companyname: companyName } : {}),
          email: input.email.trim(),
          phone: input.phone.replace(/\D/g, ''),
          password: input.password,
          password_confirmation: input.passwordConfirmation,
          agreement: true,
        },
        'Registration failed. Please check your details and try again.',
      );
      logger.info('Registration submitted', { role: input.role });
    },

    async requestPasswordReset(email: string): Promise<void> {
      await post(
        AUTH_ENDPOINTS.forgotPassword,
        { email: email.trim() },
        'We could not send the reset email. Please try again.',
      );
    },

    async resetPassword(input: ResetPasswordInput): Promise<void> {
      // The web reference sends the reset token both in the body and as a bearer header.
      await post(
        AUTH_ENDPOINTS.resetPassword,
        {
          email: input.email.trim(),
          token: input.token,
          password: input.password,
          password_confirmation: input.passwordConfirmation,
        },
        'This reset link is invalid or has expired. Request a new one.',
        input.token,
      );
    },

    async resendVerification(credentials: SignInCredentials): Promise<void> {
      await post(
        AUTH_ENDPOINTS.resendVerification,
        { email: credentials.email.trim(), password: credentials.password },
        'We could not resend the verification email. Please try again.',
      );
    },
  };
}
