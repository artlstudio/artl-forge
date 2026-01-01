import { mkdir, readdir, stat, copyFile, readFile, writeFile } from 'fs/promises';
import { join, basename, dirname } from 'path';
import type { GenerationContext } from '../types.js';
import { replaceTokens, shouldProcessFile } from '../tokens/index.js';

/**
 * Regex to match conditional file/folder names
 * Examples: [framework=fastify], [db!=none], [lang=ts|js]
 */
const CONDITION_REGEX = /\[([a-z]+)(=|!=)([a-z|]+)\]/g;

/**
 * Check if a file/folder should be included based on its conditions
 */
export function shouldIncludeFile(filename: string, ctx: GenerationContext): boolean {
  const conditions = [...filename.matchAll(CONDITION_REGEX)];

  // No conditions = always include
  if (conditions.length === 0) return true;

  // All conditions must match
  return conditions.every((match) => {
    const [, key, operator, value] = match;

    // Skip if match didn't capture properly
    if (!key || !operator || !value) return true;

    // Get context value - handle boolean conversion
    const contextKey = key as keyof GenerationContext;
    let contextValue = ctx[contextKey];

    // Convert boolean to string for comparison
    if (typeof contextValue === 'boolean') {
      contextValue = contextValue ? 'true' : 'false';
    }

    const allowedValues = value.split('|');

    if (operator === '=') {
      return allowedValues.includes(String(contextValue));
    } else {
      // != operator
      return !allowedValues.includes(String(contextValue));
    }
  });
}

/**
 * Strip condition brackets from filename
 */
export function stripConditions(filename: string): string {
  return filename.replace(CONDITION_REGEX, '');
}

/**
 * Transform extension placeholders
 * [ext] -> ts or js based on lang
 */
export function transformFilename(filename: string, ctx: GenerationContext): string {
  let result = stripConditions(filename);

  // Replace [ext] with actual extension
  result = result.replace(/\.\[ext\]$/, ctx.lang === 'ts' ? '.ts' : '.js');
  result = result.replace(/\.\[ext\]\./, ctx.lang === 'ts' ? '.ts.' : '.js.');

  return result;
}

/**
 * Process a single file: copy and transform
 */
async function processFile(
  srcPath: string,
  destPath: string,
  ctx: GenerationContext
): Promise<void> {
  // Ensure destination directory exists
  await mkdir(dirname(destPath), { recursive: true });

  if (shouldProcessFile(srcPath)) {
    // Read, transform, and write
    const content = await readFile(srcPath, 'utf-8');
    const transformed = replaceTokens(content, ctx);
    await writeFile(destPath, transformed, 'utf-8');
  } else {
    // Binary file - just copy
    await copyFile(srcPath, destPath);
  }
}

/**
 * Recursively copy template directory with transformations
 */
async function copyDirectory(
  srcDir: string,
  destDir: string,
  ctx: GenerationContext
): Promise<void> {
  const entries = await readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const shouldInclude = shouldIncludeFile(entry.name, ctx);

    if (!shouldInclude) continue;

    const transformedName = transformFilename(entry.name, ctx);
    const destPath = join(destDir, transformedName);

    if (entry.isDirectory()) {
      await mkdir(destPath, { recursive: true });
      await copyDirectory(srcPath, destPath, ctx);
    } else {
      await processFile(srcPath, destPath, ctx);
    }
  }
}

/**
 * Copy a template to the target directory
 */
export async function copyTemplate(
  templateDir: string,
  targetDir: string,
  ctx: GenerationContext
): Promise<void> {
  // Ensure target directory exists
  await mkdir(targetDir, { recursive: true });

  // Check if template directory exists
  try {
    await stat(templateDir);
  } catch {
    throw new Error(`Template directory not found: ${templateDir}`);
  }

  // Copy recursively with transformations
  await copyDirectory(templateDir, targetDir, ctx);
}
