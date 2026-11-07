import { AppError } from '@/errors/app-error';
import type { Logger } from '@/services/logging/logger';
import type { HttpMethod } from '@/types/api';

export interface ApiRequestOptions {
  path: string;
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface ApiClient {
  request<T>(options: ApiRequestOptions): Promise<T>;
}

export interface ApiClientConfig {
  baseUrl: string;
  apiVersion?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  logger?: Pick<Logger, 'debug' | 'warn'>;
}

const DEFAULT_TIMEOUT_MS = 60_000;

export function buildApiUrl(baseUrl: string, apiVersion: string | undefined, path: string): string {
  const base = baseUrl.replace(/\/+$/, '');
  const version = (apiVersion ?? '/v1').trim().replace(/^\/+|\/+$/g, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return version ? `${base}/${version}${normalizedPath}` : `${base}${normalizedPath}`;
}

function httpUserMessage(status: number): string {
  if (status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (status === 403) {
    return 'You do not have permission to do that.';
  }

  if (status === 404) {
    return 'The requested resource was not found.';
  }

  if (status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  if (status >= 500) {
    return 'The server is unavailable right now. Please try again later.';
  }

  return 'The request could not be completed. Please try again.';
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new AppError('PARSE', 'Response body was not valid JSON', {
      status: response.status,
      userMessage: 'Received an invalid response from the server.',
    });
  }
}

/**
 * Fetch-based API client with timeout, abort support, and safe error mapping.
 * It returns parsed JSON and does not validate endpoint-specific shapes.
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  const fetchImpl = config.fetchImpl ?? fetch;
  const logger = config.logger;
  const defaultTimeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const apiVersion = config.apiVersion ?? '/v1';

  return {
    async request<T>(options: ApiRequestOptions): Promise<T> {
      const method = options.method ?? 'GET';
      const timeoutMs = options.timeoutMs ?? defaultTimeoutMs;
      const url = buildApiUrl(config.baseUrl, apiVersion, options.path);
      const controller = new AbortController();
      const abortFromCaller = () => controller.abort();
      let didTimeout = false;

      const timeout = setTimeout(() => {
        didTimeout = true;
        controller.abort();
      }, timeoutMs);

      options.signal?.addEventListener('abort', abortFromCaller);

      const headers: Record<string, string> = {
        Accept: 'application/json',
        ...options.headers,
      };

      if (options.body !== undefined) {
        headers['Content-Type'] = 'application/json';
      }

      if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
      }

      let body: string | undefined;

      if (options.body !== undefined) {
        try {
          body = JSON.stringify(options.body);
        } catch {
          clearTimeout(timeout);
          options.signal?.removeEventListener('abort', abortFromCaller);
          throw new AppError('REQUEST_SERIALIZATION', 'Request body could not be serialized', {
            userMessage: 'The request could not be sent. Please try again.',
          });
        }
      }

      logger?.debug('API request', { method, path: options.path });

      try {
        const response = await fetchImpl(url, {
          method,
          headers,
          body,
          signal: controller.signal,
        });
        const payload = await readJson(response);

        if (!response.ok) {
          logger?.warn('API request failed', {
            method,
            path: options.path,
            status: response.status,
          });

          throw new AppError('HTTP', `Request failed with status ${response.status}`, {
            status: response.status,
            userMessage: httpUserMessage(response.status),
          });
        }

        logger?.debug('API response', {
          method,
          path: options.path,
          status: response.status,
        });

        return payload as T;
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }

        if (controller.signal.aborted) {
          if (didTimeout) {
            throw new AppError('TIMEOUT', `Request timed out after ${timeoutMs}ms`, {
              userMessage: 'The request took too long. Please try again.',
            });
          }

          throw new AppError('ABORTED', 'Request was cancelled', {
            userMessage: 'The request was cancelled.',
          });
        }

        throw new AppError('NETWORK', 'Network request failed', {
          userMessage: 'Unable to reach the server. Check your connection and try again.',
        });
      } finally {
        clearTimeout(timeout);
        options.signal?.removeEventListener('abort', abortFromCaller);
      }
    },
  };
}
