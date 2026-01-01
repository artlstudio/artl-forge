export type Template = 'api' | 'worker' | 'ws';
export type Framework = 'fastify' | 'express';
export type Logger = 'pino' | 'winston';
export type Database = 'postgres' | 'mysql' | 'sqlite' | 'none';
export type ORM = 'prisma' | 'sequelize' | 'none';
export type Language = 'ts' | 'js';
export type PackageManager = 'pnpm' | 'npm' | 'yarn';

export interface GenerationContext {
  projectName: string;
  projectPath: string;
  template: Template;
  framework: Framework;
  logger: Logger;
  lang: Language;
  db: Database;
  orm: ORM;
  docker: boolean;
  pm: PackageManager;
  git: boolean;
  install: boolean;
}
