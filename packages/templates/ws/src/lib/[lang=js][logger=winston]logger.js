import winston from 'winston';
import { config } from '../config/index.js';

const { combine, timestamp, json, colorize, printf } = winston.format;

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

function createLogger(baseLogger, bindings = {}) {
  return {
    fatal(message, meta) {
      baseLogger.error(message, { ...bindings, ...meta, fatal: true });
    },
    error(message, meta) {
      baseLogger.error(message, { ...bindings, ...meta });
    },
    warn(message, meta) {
      baseLogger.warn(message, { ...bindings, ...meta });
    },
    info(message, meta) {
      baseLogger.info(message, { ...bindings, ...meta });
    },
    debug(message, meta) {
      baseLogger.debug(message, { ...bindings, ...meta });
    },
    child(childBindings) {
      return createLogger(baseLogger, { ...bindings, ...childBindings });
    },
  };
}

export const logger = createLogger(winstonLogger);
