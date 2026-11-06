import { createLogger, redactLogValue } from '@/services/logging/logger';

function createSink() {
  return {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

describe('logger', () => {
  it('filters entries below the configured level', () => {
    const sink = createSink();
    const logger = createLogger('warn', sink);

    logger.debug('debug');
    logger.info('info');
    logger.warn('warn');
    logger.error('error');

    expect(sink.debug).not.toHaveBeenCalled();
    expect(sink.info).not.toHaveBeenCalled();
    expect(sink.warn).toHaveBeenCalledWith('warn');
    expect(sink.error).toHaveBeenCalledWith('error');
  });

  it('emits nothing when silent', () => {
    const sink = createSink();
    const logger = createLogger('silent', sink);

    logger.error('error');

    expect(sink.error).not.toHaveBeenCalled();
  });

  it('redacts sensitive keys recursively', () => {
    const redacted = redactLogValue({
      password: 'secret',
      nested: { accessToken: 'token', safe: 'ok' },
      list: [{ authorization: 'Bearer token' }],
    });

    expect(redacted).toEqual({
      password: '[redacted]',
      nested: { accessToken: '[redacted]', safe: 'ok' },
      list: [{ authorization: '[redacted]' }],
    });
  });

  it('handles circular context', () => {
    const context: Record<string, unknown> = { name: 'value' };
    context.self = context;

    expect(redactLogValue(context)).toEqual({ name: 'value', self: '[circular]' });
  });
});
