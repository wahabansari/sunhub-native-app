import { env } from '@/config/env';
import { logger } from '@/services/logging';

import { createApiClient } from './client';

export const apiClient = createApiClient({
  baseUrl: env.apiBaseUrl,
  apiVersion: env.apiVersion,
  timeoutMs: env.requestTimeoutMs,
  logger,
});

export type { ApiClient, ApiRequestOptions } from './client';
