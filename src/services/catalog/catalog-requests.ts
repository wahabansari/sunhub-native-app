import { apiClient, brokerApiClient } from '@/services/api';
import { EXTERNAL_ENDPOINTS } from '@/constants/api';
import type { ApiEnvelope } from '@/types/api';

const BLOG_API_URL = `${EXTERNAL_ENDPOINTS.blogPosts}?per_page=6&page=1&_embed`;

type RequestOptions = {
  /** Overrides the client default so one slow endpoint cannot hold a screen section hostage. */
  timeoutMs?: number;
};

export async function requestMain<T>(
  path: string,
  body: unknown,
  options: RequestOptions = {},
): Promise<T | undefined> {
  const response = await apiClient.request<ApiEnvelope<T>>({
    path,
    method: 'POST',
    body,
    timeoutMs: options.timeoutMs,
  });
  return response?.status === false ? undefined : response?.data;
}

/** POST that keeps the whole response (pagination included) for list endpoints. */
export async function requestMainRaw(
  path: string,
  body: unknown,
  options: RequestOptions = {},
): Promise<unknown> {
  return apiClient.request<unknown>({ path, method: 'POST', body, timeoutMs: options.timeoutMs });
}

export async function requestMainGet(path: string): Promise<unknown> {
  return apiClient.request<unknown>({ path });
}

/** Resolves to `undefined` only when no broker is configured; every failure is thrown. */
export async function requestBroker(path: string, options: RequestOptions = {}): Promise<unknown> {
  if (!brokerApiClient) return undefined;
  return brokerApiClient.request<unknown>({ path, timeoutMs: options.timeoutMs });
}

export async function requestBlog(options: RequestOptions = {}): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 20_000);
  try {
    const response = await fetch(BLOG_API_URL, { signal: controller.signal });
    if (!response.ok) throw new Error(`Blog request failed with status ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}
