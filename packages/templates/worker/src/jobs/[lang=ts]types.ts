import type { Logger } from '../lib/logger.js';

export interface Job {
  name: string;
  handler: (logger: Logger) => Promise<void>;
}
