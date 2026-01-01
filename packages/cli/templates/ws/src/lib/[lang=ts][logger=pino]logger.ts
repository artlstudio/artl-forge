import pino from 'pino';
import { config } from '../config/index.js';

export interface LogMeta {
  [key: string]: unknown;
}

export interface Logger {
  fatal(message: string, meta?: LogMeta): void;
  error(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  debug(message: string, meta?: LogMeta): void;
  child(bindings: LogMeta): Logger;
}

const transport = config.isDev
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    }
  : undefined;

const pinoLogger = pino({
  level: config.logLevel,
  transport,
  base: {
    service: '__PROJECT_NAME__',
    env: config.nodeEnv,
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

function createLogger(baseLogger: pino.Logger, bindings: LogMeta = {}): Logger {
  const boundLogger = Object.keys(bindings).length > 0 ? baseLogger.child(bindings) : baseLogger;

  return {
    fatal(message: string, meta?: LogMeta): void {
      boundLogger.fatal(meta ?? {}, message);
    },
    error(message: string, meta?: LogMeta): void {
      boundLogger.error(meta ?? {}, message);
    },
    warn(message: string, meta?: LogMeta): void {
      boundLogger.warn(meta ?? {}, message);
    },
    info(message: string, meta?: LogMeta): void {
      boundLogger.info(meta ?? {}, message);
    },
    debug(message: string, meta?: LogMeta): void {
      boundLogger.debug(meta ?? {}, message);
    },
    child(childBindings: LogMeta): Logger {
      return createLogger(boundLogger, childBindings);
    },
  };
}

export const logger: Logger = createLogger(pinoLogger);
