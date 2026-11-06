export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export type LogContext = Record<string, unknown>;

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

type LogSink = Pick<Console, 'debug' | 'info' | 'warn' | 'error'>;
type WritableLevel = Exclude<LogLevel, 'silent'>;

const LEVEL_WEIGHT: Record<WritableLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const SENSITIVE_KEY = /(token|password|secret|authorization|credential)/i;

export function redactLogValue(
  value: unknown,
  seen: WeakSet<object> = new WeakSet<object>(),
): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (seen.has(value)) {
    return '[circular]';
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((entry) => redactLogValue(entry, seen));
  }

  const result: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(value)) {
    result[key] = SENSITIVE_KEY.test(key) ? '[redacted]' : redactLogValue(entry, seen);
  }

  return result;
}

/**
 * Minimal logger with level filtering and key-based redaction. Values under
 * keys such as `token`, `password`, or `authorization` are never emitted.
 */
export function createLogger(level: LogLevel, sink: LogSink = console): Logger {
  const threshold = level === 'silent' ? Number.POSITIVE_INFINITY : LEVEL_WEIGHT[level];

  function write(entryLevel: WritableLevel, message: string, context?: LogContext): void {
    if (LEVEL_WEIGHT[entryLevel] < threshold) {
      return;
    }

    if (context === undefined) {
      sink[entryLevel](message);
      return;
    }

    sink[entryLevel](message, redactLogValue(context));
  }

  return {
    debug: (message, context) => write('debug', message, context),
    info: (message, context) => write('info', message, context),
    warn: (message, context) => write('warn', message, context),
    error: (message, context) => write('error', message, context),
  };
}
