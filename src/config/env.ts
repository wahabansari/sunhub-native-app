import { parseEnv } from './env-schema';

/**
 * Expo inlines EXPO_PUBLIC_* references at build time. Keep each reference
 * static; dynamic access such as `process.env[key]` will not be replaced.
 */
export const env = parseEnv({
  appEnv: process.env.EXPO_PUBLIC_APP_ENV,
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  brokerApiBaseUrl: process.env.EXPO_PUBLIC_BROKER_API_BASE_URL,
  mediaBaseUrl: process.env.EXPO_PUBLIC_MEDIA_BASE_URL,
  apiVersion: process.env.EXPO_PUBLIC_API_VERSION,
  requestTimeoutMs: process.env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS,
  logLevel: process.env.EXPO_PUBLIC_LOG_LEVEL,
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
});

export type { AppEnv, AppEnvConfig } from './env-schema';
