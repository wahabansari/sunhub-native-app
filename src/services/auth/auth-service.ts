import { AUTH_ENDPOINTS } from '@/constants/api';
import { AppError, isAppError } from '@/errors/app-error';
import type { ApiClient } from '@/services/api/api-client';
import type { Logger } from '@/services/logging/logger';
import type { SessionStorage } from '@/services/storage/session-storage';
import type { AuthProfile, AuthService, AuthUser, SignInCredentials } from '@/types/auth';

import {
  isActiveProfile,
  makeAuthUser,
  parseLoginResponse,
  parseProfileResponse,
} from './auth-mappers';

export interface AuthServiceDependencies {
  api: ApiClient;
  storage: SessionStorage;
  logger: Logger;
}

const INVALID_CREDENTIALS_MESSAGE = 'Unable to sign in. Check your email and password.';

export function createAuthService({ api, storage, logger }: AuthServiceDependencies): AuthService {
  async function loadProfile(accessToken: string): Promise<AuthProfile> {
    const payload = await api.request<unknown>({
      method: 'GET',
      path: AUTH_ENDPOINTS.profile,
      token: accessToken,
    });

    return parseProfileResponse(payload);
  }

  return {
    async restoreSession(): Promise<AuthUser | null> {
      const session = await storage.read();

      if (!session) {
        return null;
      }

      try {
        const profile = await loadProfile(session.accessToken);

        if (!isActiveProfile(profile.profileStatus)) {
          await storage.clear();
          return null;
        }

        return makeAuthUser(profile, session.roles);
      } catch (error) {
        if (isAppError(error) && error.status === 401) {
          await storage.clear();
          return null;
        }

        throw error;
      }
    },

    async signIn(credentials: SignInCredentials): Promise<AuthUser> {
      let payload: unknown;

      try {
        payload = await api.request<unknown>({
          method: 'POST',
          path: AUTH_ENDPOINTS.login,
          body: credentials,
        });
      } catch (error) {
        if (isAppError(error) && error.status === 401) {
          throw new AppError('AUTH_FAILED', 'Login request was unauthorized', {
            status: 401,
            userMessage: INVALID_CREDENTIALS_MESSAGE,
          });
        }

        throw error;
      }

      const login = parseLoginResponse(payload);

      let profile: AuthProfile;

      try {
        profile = await loadProfile(login.accessToken);
      } catch (error) {
        if (isAppError(error) && error.status === 401) {
          throw new AppError('AUTH_INVALID_SESSION', 'New session could not be verified', {
            status: 401,
            userMessage: 'Your session could not be verified. Please try again.',
          });
        }

        throw error;
      }

      if (!isActiveProfile(profile.profileStatus)) {
        throw new AppError('AUTH_INACTIVE', 'User profile is not active', {
          userMessage: 'This account is not active.',
        });
      }

      const user = makeAuthUser(profile, login.roles);

      await storage.write({
        accessToken: login.accessToken,
        roles: user.roles,
      });

      logger.info('User signed in', { roles: user.roles });

      return user;
    },

    async signOut(): Promise<void> {
      const session = await storage.read();

      try {
        if (session) {
          await api.request<unknown>({
            method: 'POST',
            path: AUTH_ENDPOINTS.logout,
            body: {},
            token: session.accessToken,
          });
        }
      } catch (error) {
        logger.warn('Remote sign-out failed; clearing the local session anyway', {
          code: isAppError(error) ? error.code : 'UNKNOWN',
        });
      } finally {
        await storage.clear();
      }
    },
  };
}
