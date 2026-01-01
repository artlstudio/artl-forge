import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '../config/index.js';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { healthRoutes } from './routes/health.js';

export async function buildApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
    })
  );
  app.use(helmet());

  app.use(requestLogger);

  app.use(healthRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  let httpServer;

  const server = {
    listen: (options) => {
      return new Promise((resolve) => {
        httpServer = app.listen(options.port, options.host, () => {
          resolve();
        });
      });
    },
    close: () => {
      return new Promise((resolve, reject) => {
        if (httpServer) {
          httpServer.close((err) => {
            if (err) reject(err);
            else resolve();
          });
        } else {
          resolve();
        }
      });
    },
  };

  return server;
}
