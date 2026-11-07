export type AppErrorCode =
  | 'CONFIG'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'ABORTED'
  | 'HTTP'
  | 'PARSE'
  | 'REQUEST_SERIALIZATION'
  | 'AUTH_FAILED'
  | 'AUTH_INACTIVE'
  | 'AUTH_INVALID_RESPONSE'
  | 'AUTH_INVALID_SESSION'
  | 'STORAGE'
  | 'UNKNOWN';

export interface AppErrorOptions {
  status?: number;
  userMessage?: string;
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

  constructor(code: AppErrorCode, message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = options.status;
    this.userMessage = options.userMessage ?? DEFAULT_USER_MESSAGE;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
