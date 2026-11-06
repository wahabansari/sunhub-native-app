import { AppError, isAppError, toErrorCode, toUserMessage } from '@/errors';

describe('AppError', () => {
  it('uses a safe default user message', () => {
    const error = new AppError('NETWORK', 'Network failed');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AppError');
    expect(error.code).toBe('NETWORK');
    expect(error.status).toBeUndefined();
    expect(error.userMessage).toBe('Something went wrong. Please try again.');
  });

  it('keeps explicit options', () => {
    const error = new AppError('HTTP', 'Server failed', {
      status: 500,
      userMessage: 'Try later.',
    });

    expect(error.status).toBe(500);
    expect(error.userMessage).toBe('Try later.');
  });

  it('identifies app errors', () => {
    expect(isAppError(new AppError('UNKNOWN', 'x'))).toBe(true);
    expect(isAppError(new Error('x'))).toBe(false);
  });

  it('maps unknown errors to a generic user message', () => {
    expect(toUserMessage(new AppError('HTTP', 'x', { userMessage: 'Safe.' }))).toBe('Safe.');
    expect(toUserMessage(new Error('internal'))).toBe('Something went wrong. Please try again.');
    expect(toErrorCode(new AppError('TIMEOUT', 'x'))).toBe('TIMEOUT');
    expect(toErrorCode(new Error('x'))).toBe('UNKNOWN');
  });
});
