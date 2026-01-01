import express from 'express';
import cors from 'cors';
import { config } from '../config/index.js';
import { healthRoutes } from './routes/health.js';

export function createApp() {
  const app = express();

  // CORS
  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
    })
  );

  // Health routes
  app.use(healthRoutes);

  return app;
}
