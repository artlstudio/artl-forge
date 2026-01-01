import { execSync } from 'child_process';
import { stat, readdir, mkdir } from 'fs/promises';

/**
 * Check if a path exists
 */
export async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a directory is empty
 */
export async function isEmptyDir(path: string): Promise<boolean> {
  try {
    const entries = await readdir(path);
    return entries.length === 0;
  } catch {
    // Directory doesn't exist - consider it empty
    return true;
  }
}

/**
 * Ensure a directory exists
 */
export async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

/**
 * Initialize a git repository
 */
export function gitInit(cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      execSync('git init', {
        cwd,
        stdio: 'pipe',
      });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
