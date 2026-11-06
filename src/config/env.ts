import { parseEnv } from './envSchema';

/**
 * Expo inlines EXPO_PUBLIC_* references at build time. Keep each reference
 * static; dynamic access such as `process.env[key]` will not be replaced.
 */
export const env = parseEnv({
  appEnv: process.env.EXPO_PUBLIC_APP_ENV,
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  apiVersion: process.env.EXPO_PUBLIC_API_VERSION,
  requestTimeoutMs: process.env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS,
  logLevel: process.env.EXPO_PUBLIC_LOG_LEVEL,
});

export type { AppEnv, AppEnvConfig } from './envSchema';
