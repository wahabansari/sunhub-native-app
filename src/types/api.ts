export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Common shape returned by the backend. Not every endpoint populates every
 * field, so consumers must validate before reading.
 */
export interface ApiEnvelope<T> {
  status?: boolean;
  message?: string;
  code?: number | string;
  error?: string;
  errors?: string[];
  data?: T;
}
