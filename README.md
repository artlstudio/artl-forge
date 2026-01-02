<p align="center">
  <img src="https://cdn.artlstatic.com/images/logo/artlstudio-short.png" alt="Artl Studio" width="80" />
</p>

<h1 align="center">Artl Forge</h1>

<p align="center">
  <strong>Production-ready backend baseline generator</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/artl">
    <img src="https://img.shields.io/npm/v/artl.svg?style=flat-square" alt="npm version" />
  </a>
  <a href="https://github.com/artlstudio/artl-forge/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT License" />
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg?style=flat-square" alt="Node.js" />
  </a>
</p>

<p align="center">
  Create production-ready backend projects in seconds.<br/>
  Fastify or Express. TypeScript or JavaScript. Prisma or Sequelize.<br/>
  <strong>Your stack, your choice.</strong>
</p>

<p align="center">
  <em>
    “Production-ready” refers to operational defaults (logging, health checks, config validation, shutdown).<br/>
    Application features like authentication and authorization are intentionally opt-in.
  </em>
</p>

---

## Quick Start

```bash
# Interactive mode
npx artl init my-api

# Non-interactive with defaults
npx artl init my-api --yes

# Fully customized
npx artl init my-api \
  --template api \
  --framework fastify \
  --logger pino \
  --db postgres \
  --orm prisma \
  --lang ts \
  --docker \
  --yes
```

## Installation

```bash
# Recommended (always latest)
npx artl init my-project

# Optional: install globally
npm install -g artl
```

## Features

| Feature | Description |
|---------|-------------|
| **Framework Choice** | Fastify (default) or Express |
| **TypeScript/JavaScript** | Full support for both languages |
| **Database Support** | PostgreSQL, MySQL, SQLite, or none |
| **ORM Selection** | Prisma or Sequelize |
| **Multiple Templates** | REST API, Background Worker, WebSocket Server |
| **Dockerfile + docker-compose (optional)** | Multi-stage Dockerfile + docker-compose |
| **Production Defaults** | Structured logging, health checks, graceful shutdown |
| **Modern Tooling** | ESLint 9, Prettier, Vitest pre-configured |

## Templates

### API Server (`--template api`)

Production REST API with:
- Health endpoints (`/healthz`, `/readyz`) for Kubernetes
- Swagger/OpenAPI documentation at `/docs`
- Request logging with correlation IDs
- CORS and security headers (Helmet)
- Graceful shutdown handling
- Database connection pooling

### Background Worker (`--template worker`)

Job processing service with:
- Cron-based job scheduling
- Structured logging
- Graceful shutdown with in-flight job handling
- Database connectivity (optional)

### WebSocket Server (`--template ws`)

Real-time server with:
- Socket.io integration
- Room management
- Authentication middleware hooks
- Health endpoints for load balancers

## CLI Options

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `--template`, `-t` | `api`, `worker`, `ws` | `api` | Project template |
| `--framework`, `-f` | `fastify`, `express` | `fastify` | Web framework |
| `--logger`, `-l` | `pino`, `winston` | `pino` | Logging library |
| `--lang` | `ts`, `js` | `ts` | Language |
| `--db` | `postgres`, `mysql`, `sqlite`, `none` | `postgres` | Database |
| `--orm` | `prisma`, `sequelize`, `none` | `prisma` | ORM |
| `--docker` | flag | enabled | Generate Docker files |
| `--no-docker` | flag | - | Skip Docker files |
| `--pm` | `pnpm`, `npm`, `yarn` | auto-detect | Package manager |
| `--git` | flag | enabled | Initialize git repo |
| `--no-git` | flag | - | Skip git init |
| `--install` | flag | enabled | Install dependencies |
| `--no-install` | flag | - | Skip install |
| `--yes`, `-y` | flag | - | Skip prompts, use defaults |

## Generated Project Structure

### With Prisma

```
my-api/
├── src/
│   ├── index.ts              # Application entry point
│   ├── config/
│   │   └── env.ts            # Environment validation (Zod)
│   ├── app/
│   │   ├── plugins/          # Fastify plugins / Express middleware
│   │   └── routes/           # Route handlers
│   └── lib/
│       ├── logger.ts         # Unified logger interface
│       ├── db/
│       │   └── client.ts     # Prisma client
│       └── shutdown.ts       # Graceful shutdown handler
├── prisma/
│   └── schema.prisma         # Database schema
├── prisma.config.ts          # Prisma 6 config
├── Dockerfile                # Multi-stage production build
├── docker-compose.yml        # App + database services
└── .env.example
```

### With Sequelize

```
my-api/
├── src/
│   ├── index.ts
│   ├── config/
│   │   └── env.ts
│   ├── app/
│   │   ├── plugins/
│   │   └── routes/
│   └── lib/
│       ├── logger.ts
│       ├── db/
│       │   ├── client.ts     # Sequelize client + model loader
│       │   └── models/
│       │       ├── index.ts  # Model exports
│       │       ├── User.ts   # Example User model
│       │       └── Post.ts   # Example Post model (with associations)
│       └── shutdown.ts
├── migrations/               # Sequelize migrations
├── seeders/                  # Sequelize seeders
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Post-Generation Commands

```bash
cd my-api

# Start development server
pnpm dev

# Run with Docker
docker-compose up -d

# Database commands (Prisma)
pnpm db:migrate     # Run migrations
pnpm db:generate    # Generate client
pnpm db:studio      # Open Prisma Studio

# Database commands (Sequelize)
pnpm db:migrate     # Run migrations
pnpm db:seed        # Run seeders

# Build for production
pnpm build
pnpm start
```

## Unified Logger API

Both Pino and Winston use a unified API. Switch loggers without changing your code:

```typescript
import { logger } from './lib/logger.js';

// Message first, then optional metadata
logger.info('Server started', { port: 3000 });
logger.error('Request failed', { error: err.message });
logger.debug('Processing', { itemId });

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

// Create with association
const user = await User.create({ email: 'user@example.com', name: 'John' });
const post = await Post.create({ title: 'Hello', content: '...', authorId: user.id });
```

## Requirements

- **Node.js** >= 18.0.0
- **pnpm**, **npm**, or **yarn**
- **Docker** (optional, for containerization)

## Philosophy

Artl Forge generates a production-ready baseline with sane defaults:

1. **Validated Configuration** - Environment variables validated with Zod at startup
2. **Structured Logging** - JSON logs with correlation IDs for observability
3. **Health Checks** - Kubernetes-ready liveness (`/healthz`) and readiness (`/readyz`) probes
4. **Graceful Shutdown** - Proper cleanup on SIGTERM/SIGINT signals
5. **Security by Default** - CORS, Helmet, secure headers configured out of the box
6. **Type Safety** - Full TypeScript support with strict configuration

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
git clone https://github.com/artlstudio/artl-forge.git
cd artl-forge
pnpm install
pnpm build
pnpm test
```

## License

MIT - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with care by <a href="https://artlstudio.com">Artl Studio</a>
</p>
