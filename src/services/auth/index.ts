import { apiClient } from '@/services/api';
import { logger } from '@/services/logging';
import { createSessionStorage } from '@/services/storage/session-storage';

import { createAccountService } from './account-service';
import { createAuthService } from './auth-service';

export const authService = createAuthService({
  api: apiClient,
  storage: createSessionStorage(),
  logger,
});

export const accountService = createAccountService({ api: apiClient, logger });

export type { AccountServiceDependencies } from './account-service';
export type { AuthServiceDependencies } from './auth-service';
