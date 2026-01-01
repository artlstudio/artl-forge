import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('artl init (integration)', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'artl-test-'));
  });

  afterEach(() => {
    if (tempDir && existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should generate a project with --yes flag', () => {
    const projectName = 'test-api';
    const projectPath = join(tempDir, projectName);

    // Run CLI - note: this requires the CLI to be built first
    execSync(
      `node ${join(__dirname, '../dist/index.js')} init ${projectName} --yes --no-install --no-git`,
      { cwd: tempDir, stdio: 'pipe' }
    );

    // Verify project structure
    expect(existsSync(projectPath)).toBe(true);
    expect(existsSync(join(projectPath, 'package.json'))).toBe(true);
    expect(existsSync(join(projectPath, 'src/index.ts'))).toBe(true);
    expect(existsSync(join(projectPath, 'src/config/index.ts'))).toBe(true);
    expect(existsSync(join(projectPath, 'src/lib/logger.ts'))).toBe(true);
    expect(existsSync(join(projectPath, 'Dockerfile'))).toBe(true);
    expect(existsSync(join(projectPath, 'prisma/schema.prisma'))).toBe(true);

    // Verify package.json content
    const packageJson = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf-8'));
    expect(packageJson.name).toBe(projectName);
    expect(packageJson.dependencies.fastify).toBeDefined();
    expect(packageJson.dependencies.pino).toBeDefined();
    expect(packageJson.dependencies['@prisma/client']).toBeDefined();
  });

  it('should generate an Express project', () => {
    const projectName = 'express-api';
    const projectPath = join(tempDir, projectName);

    execSync(
      `node ${join(__dirname, '../dist/index.js')} init ${projectName} --framework express --yes --no-install --no-git`,
      { cwd: tempDir, stdio: 'pipe' }
    );

    expect(existsSync(projectPath)).toBe(true);

    const packageJson = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf-8'));
    expect(packageJson.dependencies.express).toBeDefined();
    expect(packageJson.dependencies.fastify).toBeUndefined();
  });

  it('should generate a project without Docker', () => {
    const projectName = 'no-docker-api';
    const projectPath = join(tempDir, projectName);

    execSync(
      `node ${join(__dirname, '../dist/index.js')} init ${projectName} --no-docker --yes --no-install --no-git`,
      { cwd: tempDir, stdio: 'pipe' }
    );

    expect(existsSync(projectPath)).toBe(true);
    expect(existsSync(join(projectPath, 'Dockerfile'))).toBe(false);
  });

  it('should generate a project without database', () => {
    const projectName = 'no-db-api';
    const projectPath = join(tempDir, projectName);

    execSync(
      `node ${join(__dirname, '../dist/index.js')} init ${projectName} --db none --yes --no-install --no-git`,
      { cwd: tempDir, stdio: 'pipe' }
    );

    expect(existsSync(projectPath)).toBe(true);
    expect(existsSync(join(projectPath, 'prisma'))).toBe(false);

    const packageJson = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf-8'));
    expect(packageJson.dependencies['@prisma/client']).toBeUndefined();
  });

  it('should generate a worker project', () => {
    const projectName = 'test-worker';
    const projectPath = join(tempDir, projectName);

    execSync(
      `node ${join(__dirname, '../dist/index.js')} init ${projectName} --template worker --yes --no-install --no-git`,
      { cwd: tempDir, stdio: 'pipe' }
    );

    expect(existsSync(projectPath)).toBe(true);
    expect(existsSync(join(projectPath, 'src/jobs/example.ts'))).toBe(true);
    expect(existsSync(join(projectPath, 'src/scheduler/index.ts'))).toBe(true);

    const packageJson = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf-8'));
    expect(packageJson.dependencies['node-cron']).toBeDefined();
  });

  it('should generate a WebSocket project', () => {
    const projectName = 'test-ws';
    const projectPath = join(tempDir, projectName);

    execSync(
      `node ${join(__dirname, '../dist/index.js')} init ${projectName} --template ws --yes --no-install --no-git`,
      { cwd: tempDir, stdio: 'pipe' }
    );

    expect(existsSync(projectPath)).toBe(true);
    expect(existsSync(join(projectPath, 'src/socket/index.ts'))).toBe(true);
    expect(existsSync(join(projectPath, 'src/socket/auth.ts'))).toBe(true);

    const packageJson = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf-8'));
    expect(packageJson.dependencies['socket.io']).toBeDefined();
  });
});
