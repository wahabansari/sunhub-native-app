export type AppErrorCode =
  | 'CONFIG'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'ABORTED'
  | 'HTTP'
  | 'PARSE'
  | 'REQUEST_SERIALIZATION'
  | 'AUTH_FAILED'
  | 'AUTH_UNVERIFIED'
  | 'ACCOUNT_REQUEST_FAILED'
  | 'CART_REQUEST_FAILED'
  | 'CHECKOUT_FAILED'
  | 'AUTH_INACTIVE'
  | 'AUTH_INVALID_RESPONSE'
  | 'AUTH_INVALID_SESSION'
  | 'STORAGE'
  | 'UNKNOWN';

export interface AppErrorOptions {
  status?: number;
  userMessage?: string;
  /** Safe, human-readable messages the server returned for a rejected request. */
  serverMessages?: string[];
  /** First server message per form field (e.g. `email`), when the server reports field errors. */
  fieldErrors?: Record<string, string>;
}

const DEFAULT_USER_MESSAGE = 'Something went wrong. Please try again.';

/**
 * Error type used across the app. `message` is for developers/logs;
 * `userMessage` is safe to display in the UI.
 */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status?: number;
  readonly userMessage: string;
  readonly serverMessages: string[];
  readonly fieldErrors: Record<string, string>;

  constructor(code: AppErrorCode, message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = options.status;
    this.userMessage = options.userMessage ?? DEFAULT_USER_MESSAGE;
    this.serverMessages = options.serverMessages ?? [];
    this.fieldErrors = options.fieldErrors ?? {};
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
