import { apiClient } from '@/services/api';
import { logger } from '@/services/logging';
import { createSessionStorage } from '@/services/storage/sessionStorage';

import { createAuthService } from './authService';

export const authService = createAuthService({
  api: apiClient,
  storage: createSessionStorage(),
  logger,
});

export type { AuthServiceDependencies } from './authService';
