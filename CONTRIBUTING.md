# Contributing to Artl Forge

Thank you for your interest in contributing to Artl Forge! This document provides comprehensive guidelines for contributing to the project.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Template System](#template-system)
- [Making Changes](#making-changes)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Getting Started

```bash
# Clone the repository
git clone https://github.com/artlstudio/artl-forge.git
cd artl-forge

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

### Testing the CLI Locally

```bash
# After building, test from project root
node packages/cli/dist/index.js init test-project --yes

# Or test specific configurations
node packages/cli/dist/index.js init test-api --orm sequelize --logger winston
node packages/cli/dist/index.js init test-ws -t ws --yes
node packages/cli/dist/index.js init test-worker -t worker --db sqlite
```

## Project Architecture

### Monorepo Structure

```
artl-forge/
├── packages/
│   ├── cli/                    # Published to npm as "artl"
│   │   ├── src/
│   │   │   ├── index.ts        # CLI entry point
│   │   │   ├── commands/       # CLI commands (init)
│   │   │   └── prompts/        # Interactive prompts (@clack/prompts)
│   │   ├── templates/          # Copied from packages/templates during build
│   │   └── tsup.config.ts      # Bundles @artl-forge/core into CLI
│   │
│   ├── core/                   # Internal utilities (bundled into CLI, never published)
│   │   └── src/
│   │       ├── templates/
│   │       │   ├── copier.ts       # Template file copying & conditional logic
│   │       │   └── package-json.ts # Dynamic package.json generation
│   │       ├── tokens/
│   │       │   └── replacer.ts     # Token replacement (__PROJECT_NAME__, etc.)
│   │       ├── validation/         # Input validation
│   │       └── types.ts            # Shared TypeScript types
│   │
│   └── templates/              # Source templates (copied to CLI during build)
│       ├── api/                # REST API template
│       │   ├── src/
│       │   │   ├── [lang=ts]index.ts
│       │   │   ├── [lang=js]index.js
│       │   │   ├── config/
│       │   │   ├── app/
│       │   │   │   ├── [framework=fastify]plugins/
│       │   │   │   ├── [framework=express]middleware/
│       │   │   │   └── routes/
│       │   │   └── lib/
│       │   │       ├── [lang=ts][logger=pino]logger.ts
│       │   │       ├── [lang=ts][logger=winston]logger.ts
│       │   │       ├── [db!=none]db/
│       │   │       │   ├── [orm=prisma][lang=ts]client.ts
│       │   │       │   └── [orm=sequelize]models/
│       │   │       └── shutdown.ts
│       │   ├── [orm=prisma]prisma/
│       │   ├── Dockerfile
│       │   └── .env.example
│       │
│       ├── worker/             # Background worker template
│       └── ws/                 # WebSocket server template
│
├── package.json                # Root workspace config
└── pnpm-workspace.yaml
```

### Build Pipeline

1. **packages/core** builds with `tsc` → outputs to `dist/`
2. **packages/cli** builds with `tsup`:
   - Bundles `@artl-forge/core` into a single file
   - Copies templates from `packages/templates/` to `packages/cli/templates/`
3. Only **packages/cli** is published to npm (as `artl`)

### Key Files

| File | Purpose |
|------|---------|
| `packages/cli/src/commands/init.ts` | Main `artl init` command logic |
| `packages/cli/src/prompts/index.ts` | Interactive prompts using @clack/prompts |
| `packages/core/src/templates/copier.ts` | Template processing engine |
| `packages/core/src/templates/package-json.ts` | Dynamic package.json generation |
| `packages/core/src/tokens/replacer.ts` | Token replacement logic |
| `packages/core/src/types.ts` | TypeScript types for all options |

## Template System

### Conditional File Naming

Files are conditionally included based on user choices using bracket syntax in filenames:

| Pattern | Meaning | Example |
|---------|---------|---------|
| `[key=value]` | Include if key equals value | `[framework=fastify]app.ts` |
| `[key!=value]` | Include if key doesn't equal value | `[db!=none]client.ts` |
| `[key=a\|b]` | Include if key is a OR b | `[lang=ts\|js]config.ts` |
| `.[ext]` | Transform extension based on lang | `index.[ext]` → `index.ts` |

**Multiple conditions** can be combined: `[lang=ts][orm=prisma]client.ts`

**Implementation**: See `packages/core/src/templates/copier.ts`:
- `shouldIncludeFile()` - Evaluates conditions
- `stripConditions()` - Removes brackets from final filename
- `transformFilename()` - Handles `.[ext]` transformation

### Token Replacement

Template files contain tokens that are replaced during generation:

| Token | Replaced With | Example |
|-------|---------------|---------|
| `__PROJECT_NAME__` | User's project name | `my-api` |
| `__DB_PROVIDER__` | Database provider | `postgresql`, `mysql`, `sqlite` |

**Processed file types**: `.ts`, `.js`, `.json`, `.md`, `.yml`, `.yaml`, `.env*`, `.prisma`

**Implementation**: See `packages/core/src/tokens/replacer.ts`

### Logger API Convention

All logger implementations (Pino and Winston) use a **unified interface**:

```typescript
// Interface all loggers must implement
interface Logger {
  fatal(message: string, meta?: object): void;
  error(message: string, meta?: object): void;
  warn(message: string, meta?: object): void;
  info(message: string, meta?: object): void;
  debug(message: string, meta?: object): void;
  child(bindings: object): Logger;
}

// Usage - message first, then optional metadata
logger.info('Server started', { port: 3000 });
logger.error('Request failed', { error: err.message });

// Child loggers for request context
const reqLogger = logger.child({ requestId: '123' });
```

**Important**: Winston doesn't have a native `fatal` level - it's mapped to `error` with `{ fatal: true }` metadata.

### Sequelize Models Structure

When `--orm sequelize` is selected, the template includes example models with associations:

```
src/lib/db/
├── client.ts           # Sequelize instance + model initialization
└── models/
    ├── index.ts        # Re-exports all models
    ├── User.ts         # Example User model
    └── Post.ts         # Example Post model with User association
```

**User model** (`User.ts`):
```typescript
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare name: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare posts?: NonAttribute<Post[]>;

  static initialize(sequelize: Sequelize): void { /* ... */ }
  static associate(): void {
    User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
  }
}
```

**Post model** (`Post.ts`) - demonstrates associations:
```typescript
export class Post extends Model<...> {
  declare authorId: number;
  declare author?: NonAttribute<User>;

  static associate(): void {
    Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
  }
}
```

## Making Changes

### Adding a New Template Variant

Example: Adding a new logger (e.g., Bunyan)

1. **Add the type** in `packages/core/src/types.ts`:
   ```typescript
   export type LoggerType = 'pino' | 'winston' | 'bunyan';
   ```

2. **Add dependencies** in `packages/core/src/templates/package-json.ts`

3. **Create template files** with conditional naming:
   ```
   packages/templates/api/src/lib/[lang=ts][logger=bunyan]logger.ts
   packages/templates/api/src/lib/[lang=js][logger=bunyan]logger.js
   ```

4. **Update prompts** in `packages/cli/src/prompts/index.ts`

5. **Test**:
   ```bash
   pnpm build
   node packages/cli/dist/index.js init test --logger bunyan
   ```

### Modifying Existing Templates

1. Find the template file in `packages/templates/`
2. Make changes (remember to update both TS and JS variants if applicable)
3. Build and test:
   ```bash
   pnpm build
   node packages/cli/dist/index.js init test-project --yes
   cd test-project
   pnpm dev
   ```

### Adding Dependencies to Generated Projects

Edit `packages/core/src/templates/package-json.ts`. Dependencies are added conditionally based on user selections:

```typescript
// Example: adding a dependency only for Fastify projects
if (options.framework === 'fastify') {
  dependencies['@fastify/cors'] = '^10.0.0';
}
```

## Code Style

- TypeScript for all source code
- Follow existing patterns in the codebase
- Run checks before committing:
  ```bash
  pnpm lint && pnpm typecheck && pnpm test
  ```

## Testing

### Unit Tests

```bash
pnpm test
```

### Integration Tests

```bash
pnpm build
pnpm test:integration
```

### Manual Testing Matrix

Test these combinations before submitting PRs that affect templates:

```bash
# Prisma + Pino (default)
node packages/cli/dist/index.js init test-1 --yes

# Sequelize + Winston
node packages/cli/dist/index.js init test-2 --orm sequelize --logger winston

# Express + MySQL
node packages/cli/dist/index.js init test-3 -f express --db mysql

# JavaScript project
node packages/cli/dist/index.js init test-4 --lang js --yes

# Worker template
node packages/cli/dist/index.js init test-5 -t worker --yes

# WebSocket template
node packages/cli/dist/index.js init test-6 -t ws --yes
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(cli): add --verbose flag for detailed output
fix(core): handle Windows paths correctly
fix(templates): fix Winston logger fatal level
docs: update README with Sequelize info
chore: update dependencies
refactor(templates): simplify logger setup
test: add integration tests for worker template
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run all checks:
   ```bash
   pnpm lint && pnpm typecheck && pnpm test
   ```
5. Create a changeset:
   ```bash
   pnpm changeset
   ```
6. Commit and push
7. Open a Pull Request

### PR Checklist

- [ ] Code follows existing patterns
- [ ] All checks pass (`pnpm lint && pnpm typecheck && pnpm test`)
- [ ] Tested manually with multiple configurations
- [ ] Both TypeScript and JavaScript variants updated (if applicable)
- [ ] Changeset added (run `pnpm changeset`)
- [ ] Documentation updated (if applicable)

## Releasing

Releases are automated via GitHub Actions and Changesets:

1. Changesets accumulate in `.changeset/`
2. When merged to `main`, a "Version Packages" PR is auto-created
3. Merging that PR publishes to npm

Manual release (maintainers only):
```bash
pnpm build
pnpm changeset version
pnpm release
```

## Need Help?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones

---

Thank you for contributing!
