import { isAppError } from './app-error';

export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export function toUserMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.userMessage;
  }

  return GENERIC_ERROR_MESSAGE;
}

export function toErrorCode(error: unknown): string {
  return isAppError(error) ? error.code : 'UNKNOWN';
}
