import { apiClient } from '@/services/api';
import { logger } from '@/services/logging';
import { createSessionStorage } from '@/services/storage/session-storage';

import { createAuthService } from './auth-service';

export const authService = createAuthService({
  api: apiClient,
  storage: createSessionStorage(),
  logger,
});

export type { AuthServiceDependencies } from './auth-service';
