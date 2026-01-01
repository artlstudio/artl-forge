import pino from 'pino';
import { config } from '../config/index.js';

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

function createLogger(baseLogger, bindings = {}) {
  const boundLogger = Object.keys(bindings).length > 0 ? baseLogger.child(bindings) : baseLogger;

  return {
    fatal(message, meta) {
      boundLogger.fatal(meta ?? {}, message);
    },
    error(message, meta) {
      boundLogger.error(meta ?? {}, message);
    },
    warn(message, meta) {
      boundLogger.warn(meta ?? {}, message);
    },
    info(message, meta) {
      boundLogger.info(meta ?? {}, message);
    },
    debug(message, meta) {
      boundLogger.debug(meta ?? {}, message);
    },
    child(childBindings) {
      return createLogger(boundLogger, childBindings);
    },
  };
}

export const logger = createLogger(pinoLogger);
