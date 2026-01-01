import chalk from 'chalk';
import ora from 'ora';
import type { GenerationContext } from '@artl-forge/core';
import { getInstallCommand } from '@artl-forge/core';

export function printIntro(): void {
  console.log();
  console.log(
    chalk.hex('#7C3AED').bold('  ▄▀█ █▀█ ▀█▀ █░░') +
    chalk.hex('#A78BFA').bold('   █▀ ▀█▀ █░█ █▀▄ █ █▀█')
  );
  console.log(
    chalk.hex('#7C3AED').bold('  █▀█ █▀▄ ░█░ █▄▄') +
    chalk.hex('#A78BFA').bold('   ▄█ ░█░ █▄█ █▄▀ █ █▄█')
  );
  console.log();
  console.log(chalk.dim('  Production-grade backend bootstrap CLI'));
  console.log();
}

export function printOutro(ctx: GenerationContext): void {
  console.log();
  console.log(chalk.green('✔') + chalk.bold(' Project created successfully!\n'));

  console.log(chalk.bold('Next steps:\n'));

  // Change directory
  console.log(chalk.dim('  1.') + ` cd ${chalk.cyan(ctx.projectName)}`);

  // Install dependencies (if not done)
  if (!ctx.install) {
    console.log(chalk.dim('  2.') + ` ${chalk.cyan(getInstallCommand(ctx.pm))}`);
  }

  // Database setup
  if (ctx.orm === 'prisma') {
    console.log(chalk.dim(`  ${ctx.install ? '2' : '3'}.`) + ' Set up your database:');
    console.log(chalk.dim('     •') + ` Update ${chalk.cyan('.env')} with your database URL`);
    console.log(chalk.dim('     •') + ` Run ${chalk.cyan(`${ctx.pm} run db:migrate`)} to apply migrations`);
  } else if (ctx.orm === 'sequelize') {
    console.log(chalk.dim(`  ${ctx.install ? '2' : '3'}.`) + ' Set up your database:');
    console.log(chalk.dim('     •') + ` Update ${chalk.cyan('.env')} with your database URL`);
    console.log(chalk.dim('     •') + ` Run ${chalk.cyan(`${ctx.pm} run db:migrate`)} to run migrations`);
  }

  // Start development server
  const step = ctx.orm !== 'none' ? (ctx.install ? '3' : '4') : (ctx.install ? '2' : '3');
  console.log(chalk.dim(`  ${step}.`) + ` Start the development server:`);
  console.log(chalk.dim('     ') + chalk.cyan(`${ctx.pm} run dev`));

  console.log();

  // Additional info based on template
  if (ctx.template === 'api') {
    console.log(chalk.dim('  Your API will be available at:'));
    console.log(chalk.dim('     •') + ` ${chalk.cyan('http://localhost:3000')}`);
    console.log(chalk.dim('     •') + ` Health: ${chalk.cyan('http://localhost:3000/healthz')}`);
    if (ctx.framework === 'fastify') {
      console.log(chalk.dim('     •') + ` Docs: ${chalk.cyan('http://localhost:3000/docs')}`);
    }
  } else if (ctx.template === 'ws') {
    console.log(chalk.dim('  Your WebSocket server will be available at:'));
    console.log(chalk.dim('     •') + ` ${chalk.cyan('ws://localhost:3000')}`);
    console.log(chalk.dim('     •') + ` Health: ${chalk.cyan('http://localhost:3000/healthz')}`);
  } else if (ctx.template === 'worker') {
    console.log(chalk.dim('  Your worker will start processing jobs.'));
    console.log(chalk.dim('  Check the console for job execution logs.'));
  }

  // Docker info
  if (ctx.docker && ctx.db !== 'none') {
    console.log();
    console.log(chalk.dim('  Docker:'));
    console.log(chalk.dim('     •') + ` Start services: ${chalk.cyan('docker-compose up -d')}`);
    console.log(chalk.dim('     •') + ` Stop services: ${chalk.cyan('docker-compose down')}`);
  }

  console.log();
  console.log(chalk.hex('#7C3AED')('  artlstudio.com'));
  console.log();
}

export interface Spinner {
  start: (text: string) => void;
  succeed: (text: string) => void;
  fail: (text: string) => void;
  warn: (text: string) => void;
  stop: () => void;
}

export function createSpinner(): Spinner {
  const spinner = ora({ spinner: 'dots' });

  return {
    start: (text: string) => {
      spinner.start(text);
    },
    succeed: (text: string) => {
      spinner.succeed(text);
    },
    fail: (text: string) => {
      spinner.fail(text);
    },
    warn: (text: string) => {
      spinner.warn(text);
    },
    stop: () => {
      spinner.stop();
    },
  };
}
