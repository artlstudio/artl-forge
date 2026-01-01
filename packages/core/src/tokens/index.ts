import { readFile, writeFile } from 'fs/promises';
import type { GenerationContext } from '../types.js';

/**
 * Token definitions and their corresponding context keys
 */
export const TOKEN_DEFINITIONS = {
  __PROJECT_NAME__: 'projectName',
  __FRAMEWORK__: 'framework',
  __LOGGER__: 'logger',
  __LANG__: 'lang',
  __DB__: 'db',
  __ORM__: 'orm',
  __PKG_MANAGER__: 'pm',
  __DB_PROVIDER__: 'dbProvider', // Special: derived from db
} as const;

/**
 * File extensions that should have tokens replaced
 */
const PROCESSABLE_EXTENSIONS = new Set([
  '.ts',
  '.js',
  '.tsx',
  '.jsx',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.env',
  '.example',
  '.prisma',
  '.cjs',
  '.mjs',
]);

/**
 * Check if a file should have tokens processed
 */
export function shouldProcessFile(filename: string): boolean {
  // Handle .env files specially
  if (filename.includes('.env')) return true;

  // Check extension
  const ext = filename.slice(filename.lastIndexOf('.'));
  return PROCESSABLE_EXTENSIONS.has(ext);
}

/**
 * Get the database provider name for Prisma
 */
function getDbProvider(db: string): string {
  switch (db) {
    case 'postgres':
      return 'postgresql';
    case 'mysql':
      return 'mysql';
    case 'sqlite':
      return 'sqlite';
    default:
      return 'postgresql';
  }
}

/**
 * Build token replacement map from context
 */
function buildTokenMap(ctx: GenerationContext): Map<string, string> {
  const map = new Map<string, string>();

  map.set('__PROJECT_NAME__', ctx.projectName);
  map.set('__FRAMEWORK__', ctx.framework);
  map.set('__LOGGER__', ctx.logger);
  map.set('__LANG__', ctx.lang);
  map.set('__DB__', ctx.db);
  map.set('__ORM__', ctx.orm);
  map.set('__PKG_MANAGER__', ctx.pm);
  map.set('__DB_PROVIDER__', getDbProvider(ctx.db));

  return map;
}

/**
 * Replace all tokens in a string
 */
export function replaceTokens(content: string, ctx: GenerationContext): string {
  const tokenMap = buildTokenMap(ctx);
  let result = content;

  for (const [token, value] of tokenMap) {
    result = result.replaceAll(token, value);
  }

  return result;
}

/**
 * Replace tokens in a file
 */
export async function replaceTokensInFile(filePath: string, ctx: GenerationContext): Promise<void> {
  if (!shouldProcessFile(filePath)) return;

  const content = await readFile(filePath, 'utf-8');
  const replaced = replaceTokens(content, ctx);

  if (content !== replaced) {
    await writeFile(filePath, replaced, 'utf-8');
  }
}
