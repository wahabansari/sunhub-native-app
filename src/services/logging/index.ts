import { env } from '@/config/env';

import { createLogger } from './logger';

export const logger = createLogger(env.logLevel);

export type { LogContext, Logger, LogLevel } from './logger';
