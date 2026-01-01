import { Command } from 'commander';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  validateProjectName,
  detectPackageManager,
  copyTemplate,
  generatePackageJson,
  gitInit,
  runInstall,
  ensureDir,
  pathExists,
  isEmptyDir,
} from '@artl-forge/core';
import type { GenerationContext } from '@artl-forge/core';
import { runPrompts } from '../prompts/index.js';
import { printIntro, printOutro, createSpinner } from '../ui/index.js';
import type { InitFlags } from '../types.js';
import { DEFAULTS } from '../types.js';
import { writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Templates are located relative to the CLI package (sibling to dist/)
const TEMPLATES_DIR = resolve(__dirname, '..', 'templates');

export const initCommand = new Command('init')
  .description('Create a new backend project')
  .argument('[name]', 'Project name')
  .option('-t, --template <template>', 'Template: api | worker | ws', 'api')
  .option('-f, --framework <framework>', 'Framework: fastify | express', 'fastify')
  .option('-l, --logger <logger>', 'Logger: pino | winston', 'pino')
  .option('--lang <lang>', 'Language: ts | js', 'ts')
  .option('--db <db>', 'Database: postgres | mysql | sqlite | none', 'postgres')
  .option('--orm <orm>', 'ORM: prisma | sequelize | none', 'prisma')
  .option('--docker', 'Generate Docker files', true)
  .option('--no-docker', 'Skip Docker files')
  .option('--pm <pm>', 'Package manager: pnpm | npm | yarn')
  .option('--git', 'Initialize git repository', true)
  .option('--no-git', 'Skip git initialization')
  .option('--install', 'Install dependencies', true)
  .option('--no-install', 'Skip dependency installation')
  .option('-y, --yes', 'Skip prompts, use defaults')
  .action(async (name: string | undefined, flags: InitFlags) => {
    try {
      await runInit(name, flags);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'USER_CANCELLED') {
          console.log('\nOperation cancelled.');
          process.exit(0);
        }
        console.error(`\nError: ${error.message}`);
      }
      process.exit(1);
    }
  });

async function runInit(name: string | undefined, flags: InitFlags): Promise<void> {
  // Print intro
  printIntro();

  // Detect package manager if not specified
  const detectedPm = flags.pm ?? (await detectPackageManager());

  // Run prompts or use defaults/flags
  const config = flags.yes
    ? buildContextFromFlags(name ?? 'my-api', flags, detectedPm)
    : await runPrompts(name, { ...flags, pm: detectedPm });

  // Validate project name
  const nameValidation = validateProjectName(config.projectName);
  if (!nameValidation.valid) {
    throw new Error(nameValidation.error);
  }

  // Build full project path
  const projectPath = resolve(process.cwd(), config.projectName);
  config.projectPath = projectPath;

  // Check if directory exists and is not empty
  if (await pathExists(projectPath)) {
    if (!(await isEmptyDir(projectPath))) {
      throw new Error(`Directory "${config.projectName}" already exists and is not empty`);
    }
  }

  // Create project directory
  const spinner = createSpinner();
  spinner.start('Creating project directory...');
  await ensureDir(projectPath);
  spinner.succeed('Project directory created');

  // Copy template files
  spinner.start('Copying template files...');
  const templateDir = join(TEMPLATES_DIR, config.template);

  // Check if template exists
  if (!(await pathExists(templateDir))) {
    spinner.fail('Template not found');
    throw new Error(`Template "${config.template}" not found at ${templateDir}`);
  }

  await copyTemplate(templateDir, projectPath, config);
  spinner.succeed('Template files copied');

  // Generate package.json
  spinner.start('Generating package.json...');
  const packageJson = generatePackageJson(config);
  await writeFile(
    join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf-8'
  );
  spinner.succeed('package.json generated');

  // Initialize git
  if (config.git) {
    spinner.start('Initializing git repository...');
    try {
      await gitInit(projectPath);
      spinner.succeed('Git repository initialized');
    } catch {
      spinner.warn('Git initialization failed (git may not be installed)');
    }
  }

  // Install dependencies
  if (config.install) {
    console.log(`\nInstalling dependencies with ${config.pm}...\n`);
    try {
      await runInstall(config.pm, projectPath);
      console.log('\n✔ Dependencies installed');
    } catch {
      console.log('\n⚠ Dependency installation failed');
    }
  }

  // Print outro with next steps
  printOutro(config);
}

function buildContextFromFlags(
  name: string,
  flags: InitFlags,
  detectedPm: string
): GenerationContext {
  return {
    projectName: name,
    projectPath: '',
    template: flags.template ?? DEFAULTS.template,
    framework: flags.framework ?? DEFAULTS.framework,
    logger: flags.logger ?? DEFAULTS.logger,
    lang: flags.lang ?? DEFAULTS.lang,
    db: flags.db ?? DEFAULTS.db,
    orm: flags.db === 'none' ? 'none' : (flags.orm ?? DEFAULTS.orm),
    docker: flags.docker ?? DEFAULTS.docker,
    pm: (flags.pm ?? detectedPm) as GenerationContext['pm'],
    git: flags.git ?? DEFAULTS.git,
    install: flags.install ?? DEFAULTS.install,
  };
}
