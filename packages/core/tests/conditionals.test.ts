import { describe, it, expect } from 'vitest';
import { shouldIncludeFile, stripConditions, transformFilename } from '../src/templates/copier.js';
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

describe('shouldIncludeFile', () => {
  it('should include file with no conditions', () => {
    const ctx = createContext();
    expect(shouldIncludeFile('index.ts', ctx)).toBe(true);
  });

  it('should include file when condition matches', () => {
    const ctx = createContext({ framework: 'fastify' });
    expect(shouldIncludeFile('[framework=fastify]app.ts', ctx)).toBe(true);
  });

  it('should exclude file when condition does not match', () => {
    const ctx = createContext({ framework: 'express' });
    expect(shouldIncludeFile('[framework=fastify]app.ts', ctx)).toBe(false);
  });

  it('should handle negation conditions', () => {
    const ctx = createContext({ db: 'postgres' });
    expect(shouldIncludeFile('[db!=none]client.ts', ctx)).toBe(true);
  });

  it('should exclude file when negation condition does not match', () => {
    const ctx = createContext({ db: 'none' });
    expect(shouldIncludeFile('[db!=none]client.ts', ctx)).toBe(false);
  });

  it('should handle OR conditions', () => {
    const ctx = createContext({ db: 'mysql' });
    expect(shouldIncludeFile('[db=postgres|mysql]compose.yml', ctx)).toBe(true);
  });

  it('should exclude file when OR condition does not match', () => {
    const ctx = createContext({ db: 'sqlite' });
    expect(shouldIncludeFile('[db=postgres|mysql]compose.yml', ctx)).toBe(false);
  });

  it('should handle multiple conditions (AND)', () => {
    const ctx = createContext({ framework: 'fastify', logger: 'pino' });
    expect(shouldIncludeFile('[framework=fastify][logger=pino]logger.ts', ctx)).toBe(true);
  });

  it('should exclude file when any condition fails', () => {
    const ctx = createContext({ framework: 'fastify', logger: 'winston' });
    expect(shouldIncludeFile('[framework=fastify][logger=pino]logger.ts', ctx)).toBe(false);
  });

  it('should handle boolean conditions (docker)', () => {
    const ctx = createContext({ docker: true });
    expect(shouldIncludeFile('[docker=true]Dockerfile', ctx)).toBe(true);
  });

  it('should exclude file when boolean condition is false', () => {
    const ctx = createContext({ docker: false });
    expect(shouldIncludeFile('[docker=true]Dockerfile', ctx)).toBe(false);
  });
});

describe('stripConditions', () => {
  it('should strip single condition', () => {
    expect(stripConditions('[framework=fastify]app.ts')).toBe('app.ts');
  });

  it('should strip multiple conditions', () => {
    expect(stripConditions('[framework=fastify][logger=pino]logger.ts')).toBe('logger.ts');
  });

  it('should handle files with no conditions', () => {
    expect(stripConditions('index.ts')).toBe('index.ts');
  });

  it('should strip conditions with OR', () => {
    expect(stripConditions('[db=postgres|mysql]compose.yml')).toBe('compose.yml');
  });

  it('should strip negation conditions', () => {
    expect(stripConditions('[db!=none]client.ts')).toBe('client.ts');
  });
});

describe('transformFilename', () => {
  it('should transform [ext] to .ts for TypeScript', () => {
    const ctx = createContext({ lang: 'ts' });
    expect(transformFilename('index.[ext]', ctx)).toBe('index.ts');
  });

  it('should transform [ext] to .js for JavaScript', () => {
    const ctx = createContext({ lang: 'js' });
    expect(transformFilename('index.[ext]', ctx)).toBe('index.js');
  });

  it('should strip conditions and transform extension', () => {
    const ctx = createContext({ framework: 'fastify', lang: 'ts' });
    expect(transformFilename('[framework=fastify]app.[ext]', ctx)).toBe('app.ts');
  });

  it('should handle files without [ext]', () => {
    const ctx = createContext();
    expect(transformFilename('[lang=ts]tsconfig.json', ctx)).toBe('tsconfig.json');
  });
});
