import winston from 'winston';
import { config } from '../config/index.js';

const { combine, timestamp, json, colorize, printf } = winston.format;

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

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ level, message, timestamp, service, env, ...meta }) => {
    let output = `${timestamp} ${level}: ${message}`;
    const metaKeys = Object.keys(meta);
    if (metaKeys.length > 0) {
      output += ` ${JSON.stringify(meta)}`;
    }
    return output;
  })
);

const prodFormat = combine(timestamp(), json());

const winstonLogger = winston.createLogger({
  level: config.logLevel === 'fatal' ? 'error' : config.logLevel,
  format: config.isDev ? devFormat : prodFormat,
  defaultMeta: {
    service: '__PROJECT_NAME__',
    env: config.nodeEnv,
  },
  transports: [new winston.transports.Console()],
});

function createLogger(baseLogger: winston.Logger, bindings: LogMeta = {}): Logger {
  return {
    fatal(message: string, meta?: LogMeta): void {
      baseLogger.error(message, { ...bindings, ...meta, fatal: true });
    },
    error(message: string, meta?: LogMeta): void {
      baseLogger.error(message, { ...bindings, ...meta });
    },
    warn(message: string, meta?: LogMeta): void {
      baseLogger.warn(message, { ...bindings, ...meta });
    },
    info(message: string, meta?: LogMeta): void {
      baseLogger.info(message, { ...bindings, ...meta });
    },
    debug(message: string, meta?: LogMeta): void {
      baseLogger.debug(message, { ...bindings, ...meta });
    },
    child(childBindings: LogMeta): Logger {
      return createLogger(baseLogger, { ...bindings, ...childBindings });
    },
  };
}

export const logger: Logger = createLogger(winstonLogger);
