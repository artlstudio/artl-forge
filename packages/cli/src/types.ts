import type { GenerationContext, Template, Framework, Logger, Database, ORM, Language, PackageManager } from '@artl-forge/core';

export type { GenerationContext, Template, Framework, Logger, Database, ORM, Language, PackageManager };

/**
 * CLI flags for the init command
 */
export interface InitFlags {
  template?: Template;
  framework?: Framework;
  logger?: Logger;
  lang?: Language;
  db?: Database;
  orm?: ORM;
  docker?: boolean;
  pm?: PackageManager;
  git?: boolean;
  install?: boolean;
  yes?: boolean;
}

/**
 * Default values for the init command
 */
export const DEFAULTS: Required<Omit<InitFlags, 'yes'>> = {
  template: 'api',
  framework: 'fastify',
  logger: 'pino',
  lang: 'ts',
  db: 'postgres',
  orm: 'prisma',
  docker: true,
  pm: 'pnpm',
  git: true,
  install: true,
};
