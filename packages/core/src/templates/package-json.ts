import type { GenerationContext } from '../types.js';

interface PackageJson {
  name: string;
  version: string;
  private: boolean;
  type: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

/**
 * Sort object keys alphabetically
 */
function sortObject(obj: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}

/**
 * Generate a package.json for the given context
 */
export function generatePackageJson(ctx: GenerationContext): PackageJson {
  const pkg: PackageJson = {
    name: ctx.projectName,
    version: '0.0.1',
    private: true,
    type: 'module',
    scripts: {},
    dependencies: {},
    devDependencies: {},
  };

  // === SCRIPTS ===
  if (ctx.lang === 'ts') {
    pkg.scripts = {
      dev: 'tsx watch src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js',
      typecheck: 'tsc --noEmit',
      lint: 'eslint src',
      'lint:fix': 'eslint src --fix',
      test: 'vitest run',
      'test:watch': 'vitest',
    };
  } else {
    pkg.scripts = {
      dev: 'node --watch src/index.js',
      start: 'node src/index.js',
      lint: 'eslint src',
      'lint:fix': 'eslint src --fix',
      test: 'vitest run',
      'test:watch': 'vitest',
    };
  }

  // Prisma scripts
  if (ctx.orm === 'prisma') {
    pkg.scripts['db:generate'] = 'prisma generate';
    pkg.scripts['db:migrate'] = 'prisma migrate dev';
    pkg.scripts['db:push'] = 'prisma db push';
    pkg.scripts['db:studio'] = 'prisma studio --config ./prisma.config.ts';
  }

  // Sequelize scripts
  if (ctx.orm === 'sequelize') {
    pkg.scripts['db:migrate'] = 'sequelize-cli db:migrate';
    pkg.scripts['db:migrate:undo'] = 'sequelize-cli db:migrate:undo';
    pkg.scripts['db:seed'] = 'sequelize-cli db:seed:all';
  }

  // === DEPENDENCIES ===

  // Framework
  if (ctx.template === 'api' || ctx.template === 'ws') {
    if (ctx.framework === 'fastify') {
      pkg.dependencies['fastify'] = '^5.0.0';
      pkg.dependencies['@fastify/cors'] = '^10.0.0';
      pkg.dependencies['@fastify/helmet'] = '^12.0.0';
      pkg.dependencies['@fastify/swagger'] = '^9.0.0';
      pkg.dependencies['@fastify/swagger-ui'] = '^5.0.0';
    } else {
      pkg.dependencies['express'] = '^4.21.0';
      pkg.dependencies['cors'] = '^2.8.5';
      pkg.dependencies['helmet'] = '^8.0.0';
      if (ctx.lang === 'ts') {
        pkg.devDependencies['@types/express'] = '^4.17.21';
        pkg.devDependencies['@types/cors'] = '^2.8.17';
      }
    }
  }

  // Logger
  if (ctx.logger === 'pino') {
    pkg.dependencies['pino'] = '^9.0.0';
    pkg.devDependencies['pino-pretty'] = '^11.0.0';
    if (ctx.framework === 'express' && ctx.template !== 'worker') {
      pkg.dependencies['pino-http'] = '^10.0.0';
    }
  } else {
    pkg.dependencies['winston'] = '^3.14.0';
    if (ctx.framework === 'express' && ctx.template !== 'worker') {
      pkg.dependencies['express-winston'] = '^4.2.0';
    }
  }

  // Database + ORM
  if (ctx.orm === 'prisma') {
    pkg.dependencies['@prisma/client'] = '^6.9.0';
    pkg.dependencies['@prisma/adapter-pg'] = '^6.9.0';
    pkg.dependencies['pg'] = '^8.16.0';
    pkg.devDependencies['prisma'] = '^6.9.0';
    pkg.devDependencies['@types/pg'] = '^8.15.2';
  }

  if (ctx.orm === 'sequelize') {
    pkg.dependencies['sequelize'] = '^6.37.0';
    pkg.devDependencies['sequelize-cli'] = '^6.6.0';

    // DB driver
    if (ctx.db === 'postgres') {
      pkg.dependencies['pg'] = '^8.13.0';
    } else if (ctx.db === 'mysql') {
      pkg.dependencies['mysql2'] = '^3.11.0';
    } else if (ctx.db === 'sqlite') {
      pkg.dependencies['sqlite3'] = '^5.1.7';
    }
  }

  // WebSocket template specific
  if (ctx.template === 'ws') {
    pkg.dependencies['socket.io'] = '^4.8.0';
    if (ctx.lang === 'ts') {
      // Socket.io has built-in types
    }
  }

  // Worker template specific
  if (ctx.template === 'worker') {
    pkg.dependencies['node-cron'] = '^3.0.3';
    if (ctx.lang === 'ts') {
      pkg.devDependencies['@types/node-cron'] = '^3.0.11';
    }
  }

  // Core dependencies
  pkg.dependencies['zod'] = '^3.23.0';
  pkg.dependencies['dotenv'] = '^16.4.0';

  // === DEV DEPENDENCIES ===

  if (ctx.lang === 'ts') {
    pkg.devDependencies['typescript'] = '^5.6.0';
    pkg.devDependencies['tsx'] = '^4.19.0';
    pkg.devDependencies['@types/node'] = '^22.0.0';
  }

  pkg.devDependencies['eslint'] = '^9.0.0';
  pkg.devDependencies['prettier'] = '^3.3.0';
  pkg.devDependencies['vitest'] = '^2.1.0';

  // Sort dependencies
  pkg.dependencies = sortObject(pkg.dependencies);
  pkg.devDependencies = sortObject(pkg.devDependencies);

  return pkg;
}
