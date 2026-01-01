import { describe, it, expect } from 'vitest';
import { replaceTokens } from '../src/tokens/index.js';
import type { GenerationContext } from '../src/types.js';

const createContext = (overrides: Partial<GenerationContext> = {}): GenerationContext => ({
  projectName: 'my-api',
  projectPath: '/path/to/my-api',
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
  ...overrides,
});

describe('replaceTokens', () => {
  it('should replace __PROJECT_NAME__ token', () => {
    const ctx = createContext({ projectName: 'test-app' });
    const result = replaceTokens('name: __PROJECT_NAME__', ctx);
    expect(result).toBe('name: test-app');
  });

  it('should replace __FRAMEWORK__ token', () => {
    const ctx = createContext({ framework: 'express' });
    const result = replaceTokens('framework: __FRAMEWORK__', ctx);
    expect(result).toBe('framework: express');
  });

  it('should replace __LOGGER__ token', () => {
    const ctx = createContext({ logger: 'winston' });
    const result = replaceTokens('logger: __LOGGER__', ctx);
    expect(result).toBe('logger: winston');
  });

  it('should replace __DB_PROVIDER__ token for postgres', () => {
    const ctx = createContext({ db: 'postgres' });
    const result = replaceTokens('provider = "__DB_PROVIDER__"', ctx);
    expect(result).toBe('provider = "postgresql"');
  });

  it('should replace __DB_PROVIDER__ token for mysql', () => {
    const ctx = createContext({ db: 'mysql' });
    const result = replaceTokens('provider = "__DB_PROVIDER__"', ctx);
    expect(result).toBe('provider = "mysql"');
  });

  it('should replace multiple tokens', () => {
    const ctx = createContext({ projectName: 'my-app', framework: 'fastify' });
    const result = replaceTokens('__PROJECT_NAME__ uses __FRAMEWORK__', ctx);
    expect(result).toBe('my-app uses fastify');
  });

  it('should handle content with no tokens', () => {
    const ctx = createContext();
    const result = replaceTokens('no tokens here', ctx);
    expect(result).toBe('no tokens here');
  });
});
