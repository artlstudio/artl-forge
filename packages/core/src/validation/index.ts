import { stat, readdir } from 'fs/promises';
import { resolve, isAbsolute } from 'path';

/**
 * Valid kebab-case pattern for project names
 */
const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/**
 * Reserved names that cannot be used as project names
 */
const RESERVED_NAMES = new Set([
  'node_modules',
  'favicon.ico',
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  '.git',
  '.env',
]);

/**
 * Check if a string is valid kebab-case
 */
export function isValidKebabCase(name: string): boolean {
  return KEBAB_CASE_REGEX.test(name);
}

/**
 * Validate a project name
 */
export function validateProjectName(name: string): {
  valid: boolean;
  error?: string;
  suggestion?: string;
} {
  // Check if empty
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Project name cannot be empty' };
  }

  // Check if reserved
  if (RESERVED_NAMES.has(name.toLowerCase())) {
    return { valid: false, error: `"${name}" is a reserved name` };
  }

  // Check length
  if (name.length > 214) {
    return { valid: false, error: 'Project name must be less than 214 characters' };
  }

  // Check if valid kebab-case
  if (!isValidKebabCase(name)) {
    // Try to suggest a valid name
    const suggestion = name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (isValidKebabCase(suggestion)) {
      return {
        valid: false,
        error: 'Project name must be lowercase kebab-case (e.g., my-api)',
        suggestion,
      };
    }

    return {
      valid: false,
      error: 'Project name must be lowercase kebab-case (e.g., my-api)',
    };
  }

  return { valid: true };
}

/**
 * Validate a path
 */
export async function validatePath(
  path: string,
  options: { mustExist?: boolean; mustBeEmpty?: boolean } = {}
): Promise<{ valid: boolean; error?: string; resolvedPath: string }> {
  const resolvedPath = isAbsolute(path) ? path : resolve(process.cwd(), path);

  try {
    const stats = await stat(resolvedPath);

    if (!stats.isDirectory()) {
      return { valid: false, error: 'Path exists but is not a directory', resolvedPath };
    }

    if (options.mustBeEmpty) {
      const entries = await readdir(resolvedPath);
      if (entries.length > 0) {
        return { valid: false, error: 'Directory is not empty', resolvedPath };
      }
    }

    return { valid: true, resolvedPath };
  } catch (err) {
    // Path doesn't exist
    if (options.mustExist) {
      return { valid: false, error: 'Path does not exist', resolvedPath };
    }

    // Path doesn't exist but that's okay - we'll create it
    return { valid: true, resolvedPath };
  }
}
