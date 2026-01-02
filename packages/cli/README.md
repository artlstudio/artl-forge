# Artl

![Artl Studio](https://cdn.artlstatic.com/images/logo/artlstudio-short.png)

**Production-ready backend baseline generator by Artl Studio**

[![npm version](https://img.shields.io/npm/v/artl.svg?style=flat-square)](https://www.npmjs.com/package/artl)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/artlstudio/artl-forge/blob/main/LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg?style=flat-square)](https://nodejs.org/)

Create production-ready backend baselines in seconds. Your stack, your choice.  

_Production-ready refers to operational defaults (logging, health checks, config validation, shutdown). Auth/authorization are intentionally opt-in._

## Quick Start

```bash
# Recommended (always latest)
npx artl init my-api

# Non-interactive with defaults (Fastify + Prisma + PostgreSQL)
npx artl init my-api --yes

# Optional: install globally
npm install -g artl
artl init my-api
```

## Features

- **Frameworks**: Fastify (default) or Express
- **Languages**: TypeScript (default) or JavaScript
- **Databases**: PostgreSQL, MySQL, SQLite, or none
- **ORMs**: Prisma 6 or Sequelize (with example User/Post models)
- **Loggers**: Pino (default) or Winston - unified API
- **Templates**: REST API, Background Worker, WebSocket Server
- **Production Ready**: Docker, health checks, graceful shutdown, structured logging

## Templates

### REST API (`--template api`)

Full-featured API server with:
- Routes and middleware
- Database integration (Prisma or Sequelize)
- Swagger/OpenAPI docs at `/docs`
- Health endpoints (`/healthz`, `/readyz`)
- CORS and Helmet security

### Background Worker (`--template worker`)

Job processing service with:
- Cron-based job scheduling
- Structured logging
- Graceful shutdown with in-flight job handling

### WebSocket Server (`--template ws`)

Real-time server with:
- Socket.io integration
- Room management
- Authentication middleware hooks

## CLI Options

```bash
artl init [project-name] [options]

Options:
  -t, --template <type>     api | worker | ws (default: api)
  -f, --framework <type>    fastify | express (default: fastify)
  -l, --logger <type>       pino | winston (default: pino)
  --lang <type>             ts | js (default: ts)
  --db <type>               postgres | mysql | sqlite | none (default: postgres)
  --orm <type>              prisma | sequelize | none (default: prisma)
  --docker                  Generate Docker files (default: true)
  --no-docker               Skip Docker files
  --pm <type>               pnpm | npm | yarn (default: auto-detect)
  --git                     Initialize git repository (default: true)
  --no-git                  Skip git initialization
  --install                 Install dependencies (default: true)
  --no-install              Skip dependency installation
  -y, --yes                 Skip prompts, use defaults
  -h, --help                Display help
```

## Examples

```bash
# Fastify + Prisma + PostgreSQL (recommended)
npx artl init my-api --yes

# Express + Winston + MySQL
npx artl init my-api -f express -l winston --db mysql

# Sequelize with example User/Post models
npx artl init my-api --orm sequelize --yes

# WebSocket server
npx artl init my-ws -t ws --yes

# Background worker with SQLite
npx artl init my-worker -t worker --db sqlite

# JavaScript project (no TypeScript)
npx artl init my-api --lang js --yes

# API without database
npx artl init my-api --db none --yes
```

## Generated Structure

### With Prisma

```
my-api/
├── src/
│   ├── index.ts              # Entry point
│   ├── config/
│   │   └── env.ts            # Environment validation (Zod)
│   ├── app/
│   │   ├── plugins/          # Fastify plugins / Express middleware
│   │   └── routes/           # Route handlers
│   └── lib/
│       ├── logger.ts         # Unified logger (Pino or Winston)
│       ├── db/
│       │   └── client.ts     # Prisma client
│       └── shutdown.ts       # Graceful shutdown handler
├── prisma/
│   └── schema.prisma         # Database schema
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

### With Sequelize

```
my-api/
├── src/
│   └── lib/
│       └── db/
│           ├── client.ts     # Sequelize instance + model loader
│           └── models/
│               ├── index.ts  # Re-exports all models
│               ├── User.ts   # Example User model
│               └── Post.ts   # Example Post with User association
├── migrations/               # Sequelize migrations
├── seeders/                  # Sequelize seeders
└── ...
```

## After Generation

```bash
cd my-api

# Start development server
npm run dev

# Build for production
npm run build

# Database commands (Prisma)
npm run db:migrate      # Run migrations
npm run db:generate     # Generate client
npm run db:studio       # Open Prisma Studio

# Database commands (Sequelize)
npm run db:migrate      # Run migrations
npm run db:seed         # Run seeders

# Run with Docker
docker-compose up -d
```

## Unified Logger API

Both Pino and Winston use a unified API - switch loggers without changing code:

```typescript
import { logger } from './lib/logger.js';

// Message first, then optional metadata
logger.info('Server started', { port: 3000 });
logger.error('Request failed', { error: err.message, requestId });
logger.debug('Processing item', { itemId, userId });

// Child loggers for request context
const reqLogger = logger.child({ requestId: '123' });
reqLogger.info('Handling request');
```

## Sequelize Models

When using `--orm sequelize`, you get example models with associations:

```typescript
// User model with hasMany Posts
import { User } from './lib/db/models/User.js';

// Post model with belongsTo User
import { Post } from './lib/db/models/Post.js';

// Query with associations
const users = await User.findAll({
  include: [{ model: Post, as: 'posts' }]
});
```

## Requirements

- **Node.js** >= 18.0.0
- **pnpm**, **npm**, or **yarn**
- **Docker** (optional)

## Links

- [GitHub Repository](https://github.com/artlstudio/artl-forge)
- [Full Documentation](https://github.com/artlstudio/artl-forge#readme)
- [Report Issues](https://github.com/artlstudio/artl-forge/issues)
- [Artl Studio](https://artlstudio.com)

## License

MIT - see [LICENSE](https://github.com/artlstudio/artl-forge/blob/main/LICENSE)
