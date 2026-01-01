import { execSync } from 'child_process';
import { stat } from 'fs/promises';
import { join } from 'path';
import type { PackageManager } from '../types.js';

/**
 * Lockfile names for each package manager
 */
const LOCKFILES: Record<PackageManager, string> = {
  pnpm: 'pnpm-lock.yaml',
  npm: 'package-lock.json',
  yarn: 'yarn.lock',
};

/**
 * Get the lockfile name for a package manager
 */
export function getLockfileName(pm: PackageManager): string {
  return LOCKFILES[pm];
}

/**
 * Get the install command for a package manager
 */
export function getInstallCommand(pm: PackageManager): string {
  return pm === 'yarn' ? 'yarn' : `${pm} install`;
}

/**
 * Check if a file exists
 */
async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect the package manager from lockfiles or environment
 */
export async function detectPackageManager(cwd: string = process.cwd()): Promise<PackageManager> {
  // Check for existing lockfiles
  for (const [pm, lockfile] of Object.entries(LOCKFILES) as [PackageManager, string][]) {
    if (await fileExists(join(cwd, lockfile))) {
      return pm;
    }
  }

  // Check npm_config_user_agent for the current package manager
  const userAgent = process.env['npm_config_user_agent'];
  if (userAgent) {
    if (userAgent.includes('pnpm')) return 'pnpm';
    if (userAgent.includes('yarn')) return 'yarn';
    if (userAgent.includes('npm')) return 'npm';
  }

  // Default to pnpm
  return 'pnpm';
}

/**
 * Run package manager install in a directory
 */
export function runInstall(
  pm: PackageManager,
  cwd: string,
  options: { silent?: boolean } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Build the install command with flags to ensure standalone install
      let command: string;
      if (pm === 'pnpm') {
        // --ignore-workspace ensures it installs as standalone project
        command = 'pnpm install --ignore-workspace';
      } else if (pm === 'yarn') {
        command = 'yarn';
      } else {
        command = 'npm install';
      }

      execSync(command, {
        cwd,
        stdio: options.silent ? 'pipe' : 'inherit',
        env: { ...process.env },
      });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
