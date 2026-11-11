import type { LogLevel } from '@/services/logging/logger';

export const APP_ENVIRONMENTS = ['development', 'staging', 'production'] as const;

export type AppEnv = (typeof APP_ENVIRONMENTS)[number];

export const DEFAULT_REQUEST_TIMEOUT_MS = 60_000;

const LOG_LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error', 'silent'];

export interface EnvSource {
  appEnv?: string;
  apiBaseUrl?: string;
  brokerApiBaseUrl?: string;
  mediaBaseUrl?: string;
  apiVersion?: string;
  requestTimeoutMs?: string;
  logLevel?: string;
  stripePublishableKey?: string;
}

export interface AppEnvConfig {
  appEnv: AppEnv;
  isProduction: boolean;
  apiBaseUrl: string;
  brokerApiBaseUrl: string;
  mediaBaseUrl: string;
  apiVersion: string;
  requestTimeoutMs: number;
  logLevel: LogLevel;
  /** Stripe publishable key (`pk_…`); empty when card payments are not configured. */
  stripePublishableKey: string;
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

function parseAppEnv(value: string | undefined): AppEnv {
  const normalized = (value ?? 'development').trim().toLowerCase();

  if ((APP_ENVIRONMENTS as readonly string[]).includes(normalized)) {
    return normalized as AppEnv;
  }

  throw new ConfigError(
    `EXPO_PUBLIC_APP_ENV must be one of: ${APP_ENVIRONMENTS.join(', ')}. Received: ${value}`,
  );
}

function parseApiBaseUrl(value: string | undefined): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new ConfigError('EXPO_PUBLIC_API_BASE_URL is required.');
  }

  if (!/^https?:\/\//i.test(normalized)) {
    throw new ConfigError('EXPO_PUBLIC_API_BASE_URL must start with http:// or https://.');
  }

  return normalized.replace(/\/+$/, '');
}

function parseOptionalApiBaseUrl(value: string | undefined): string {
  const normalized = value?.trim();

  if (!normalized) {
    return '';
  }

  if (!/^https?:\/\//i.test(normalized)) {
    throw new ConfigError('EXPO_PUBLIC_BROKER_API_BASE_URL must start with http:// or https://.');
  }

  return normalized.replace(/\/+$/, '');
}

function parseMediaBaseUrl(value: string | undefined): string {
  const normalized = (value ?? 'https://media.sunhub.com').trim();
  if (!/^https?:\/\//i.test(normalized)) {
    throw new ConfigError('EXPO_PUBLIC_MEDIA_BASE_URL must start with http:// or https://.');
  }
  return normalized.replace(/\/+$/, '');
}

function parseApiVersion(value: string | undefined): string {
  const normalized = (value ?? '/v1').trim().replace(/^\/+|\/+$/g, '');
  return normalized ? `/${normalized}` : '/v1';
}

function parseTimeout(value: string | undefined): number {
  if (!value?.trim()) {
    return DEFAULT_REQUEST_TIMEOUT_MS;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 300_000) {
    throw new ConfigError('EXPO_PUBLIC_REQUEST_TIMEOUT_MS must be an integer from 1 to 300000.');
  }

  return parsed;
}

/**
 * The key is bundled into the app, so only a publishable key is ever accepted. A secret key
 * (`sk_…`) here would be public to everyone who installs the app, so it is rejected outright.
 */
function parseStripeKey(value: string | undefined): string {
  const normalized = value?.trim() ?? '';

  if (!normalized) return '';

  if (!/^pk_(test|live)_[A-Za-z0-9]+$/.test(normalized)) {
    throw new ConfigError(
      'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY must be a Stripe publishable key (pk_test_… or pk_live_…).',
    );
  }

  return normalized;
}

function parseLogLevel(value: string | undefined): LogLevel {
  const normalized = (value ?? 'warn').trim().toLowerCase() as LogLevel;

  if (!LOG_LEVELS.includes(normalized)) {
    throw new ConfigError(
      `EXPO_PUBLIC_LOG_LEVEL must be one of: ${LOG_LEVELS.join(', ')}. Received: ${value}`,
    );
  }

  return normalized;
}

export function parseEnv(source: EnvSource): AppEnvConfig {
  const appEnv = parseAppEnv(source.appEnv);

  return {
    appEnv,
    isProduction: appEnv === 'production',
    apiBaseUrl: parseApiBaseUrl(source.apiBaseUrl),
    brokerApiBaseUrl: parseOptionalApiBaseUrl(source.brokerApiBaseUrl),
    mediaBaseUrl: parseMediaBaseUrl(source.mediaBaseUrl),
    apiVersion: parseApiVersion(source.apiVersion),
    requestTimeoutMs: parseTimeout(source.requestTimeoutMs),
    logLevel: parseLogLevel(source.logLevel),
    stripePublishableKey: parseStripeKey(source.stripePublishableKey),
  };
}
