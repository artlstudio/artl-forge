import * as p from '@clack/prompts';
import type { GenerationContext, Template, Framework, Logger, Database, ORM, Language, PackageManager } from '@artl-forge/core';
import { validateProjectName } from '@artl-forge/core';
import type { InitFlags } from '../types.js';
import { DEFAULTS } from '../types.js';

function isCancel(value: unknown): value is symbol {
  return p.isCancel(value);
}

function handleCancel(value: unknown): void {
  if (isCancel(value)) {
    p.cancel('Operation cancelled.');
    throw new Error('USER_CANCELLED');
  }
}

export async function runPrompts(
  providedName: string | undefined,
  flags: InitFlags
): Promise<GenerationContext> {
  // Project name
  const nameResult = await p.text({
    message: 'What is your project name?',
    placeholder: 'my-api',
    defaultValue: providedName ?? 'my-api',
    initialValue: providedName ?? '',
    validate: (value) => {
      const result = validateProjectName(value);
      if (!result.valid) {
        return result.suggestion
          ? `${result.error}. Did you mean "${result.suggestion}"?`
          : result.error;
      }
      return undefined;
    },
  });
  handleCancel(nameResult);
  const projectName = nameResult as string;

  // Template
  const templateResult = await p.select({
    message: 'Which template would you like to use?',
    options: [
      { value: 'api', label: 'API', hint: 'REST API with framework of choice' },
      { value: 'worker', label: 'Worker', hint: 'Background job processor' },
      { value: 'ws', label: 'WebSocket', hint: 'Real-time WebSocket server' },
    ],
    initialValue: flags.template ?? DEFAULTS.template,
  });
  handleCancel(templateResult);
  const template = templateResult as Template;

  // Framework (only for api and ws templates)
  let framework: Framework = DEFAULTS.framework;
  if (template === 'api' || template === 'ws') {
    const frameworkResult = await p.select({
      message: 'Which framework would you like to use?',
      options: [
        { value: 'fastify', label: 'Fastify', hint: 'Fast & low overhead (recommended)' },
        { value: 'express', label: 'Express', hint: 'Minimalist & widely adopted' },
      ],
      initialValue: flags.framework ?? DEFAULTS.framework,
    });
    handleCancel(frameworkResult);
    framework = frameworkResult as Framework;
  }

  // Language
  const langResult = await p.select({
    message: 'Which language would you like to use?',
    options: [
      { value: 'ts', label: 'TypeScript', hint: 'Type-safe (recommended)' },
      { value: 'js', label: 'JavaScript', hint: 'Plain JavaScript' },
    ],
    initialValue: flags.lang ?? DEFAULTS.lang,
  });
  handleCancel(langResult);
  const lang = langResult as Language;

  // Logger
  const loggerResult = await p.select({
    message: 'Which logger would you like to use?',
    options: [
      { value: 'pino', label: 'Pino', hint: 'Fast & JSON-native (recommended)' },
      { value: 'winston', label: 'Winston', hint: 'Feature-rich & flexible' },
    ],
    initialValue: flags.logger ?? DEFAULTS.logger,
  });
  handleCancel(loggerResult);
  const logger = loggerResult as Logger;

  // Database
  const dbResult = await p.select({
    message: 'Which database would you like to use?',
    options: [
      { value: 'postgres', label: 'PostgreSQL', hint: 'Production-ready (recommended)' },
      { value: 'mysql', label: 'MySQL', hint: 'Popular relational DB' },
      { value: 'sqlite', label: 'SQLite', hint: 'File-based, great for local dev' },
      { value: 'none', label: 'None', hint: 'No database setup' },
    ],
    initialValue: flags.db ?? DEFAULTS.db,
  });
  handleCancel(dbResult);
  const db = dbResult as Database;

  // ORM (only if database is selected)
  let orm: ORM = 'none';
  if (db !== 'none') {
    const ormResult = await p.select({
      message: 'Which ORM would you like to use?',
      options: [
        { value: 'prisma', label: 'Prisma', hint: 'Type-safe & modern (recommended)' },
        { value: 'sequelize', label: 'Sequelize', hint: 'Mature & feature-rich' },
        { value: 'none', label: 'None', hint: 'Raw database queries' },
      ],
      initialValue: flags.orm ?? DEFAULTS.orm,
    });
    handleCancel(ormResult);
    orm = ormResult as ORM;
  }

  // Docker
  const dockerResult = await p.confirm({
    message: 'Generate Docker files?',
    initialValue: flags.docker ?? DEFAULTS.docker,
  });
  handleCancel(dockerResult);
  const docker = dockerResult as boolean;

  // Package manager
  const pmResult = await p.select({
    message: 'Which package manager would you like to use?',
    options: [
      { value: 'pnpm', label: 'pnpm', hint: 'Fast & disk-efficient (recommended)' },
      { value: 'npm', label: 'npm', hint: 'Default Node.js package manager' },
      { value: 'yarn', label: 'yarn', hint: 'Alternative package manager' },
    ],
    initialValue: flags.pm ?? DEFAULTS.pm,
  });
  handleCancel(pmResult);
  const pm = pmResult as PackageManager;

  // Git
  const gitResult = await p.confirm({
    message: 'Initialize a git repository?',
    initialValue: flags.git ?? DEFAULTS.git,
  });
  handleCancel(gitResult);
  const git = gitResult as boolean;

  // Install
  const installResult = await p.confirm({
    message: 'Install dependencies?',
    initialValue: flags.install ?? DEFAULTS.install,
  });
  handleCancel(installResult);
  const install = installResult as boolean;

  return {
    projectName,
    projectPath: '',
    template,
    framework,
    logger,
    lang,
    db,
    orm,
    docker,
    pm,
    git,
    install,
  };
}
