import { env } from '@/config/env';
import { logger } from '@/services/logging';

import { createApiClient } from './api-client';

export const apiClient = createApiClient({
  baseUrl: env.apiBaseUrl,
  apiVersion: env.apiVersion,
  timeoutMs: env.requestTimeoutMs,
  logger,
});

export const brokerApiClient = env.brokerApiBaseUrl
  ? createApiClient({
      baseUrl: env.brokerApiBaseUrl,
      apiVersion: '',
      timeoutMs: env.requestTimeoutMs,
      logger,
    })
  : null;

export type { ApiClient, ApiRequestOptions } from './api-client';
