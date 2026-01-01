# __PROJECT_NAME__

Production-grade API generated with [Artl Forge](https://github.com/artlstudio/artl-forge).

## Getting Started

1. Install dependencies:

```bash
__PKG_MANAGER__ install
```

2. Set up your environment:

```bash
cp .env.example .env
# Edit .env with your database URL
```

3. Set up the database:

```bash
__PKG_MANAGER__ run db:migrate
```

4. Start the development server:

```bash
__PKG_MANAGER__ run dev
```

## Scripts

- `__PKG_MANAGER__ run dev` - Start development server with hot reload
- `__PKG_MANAGER__ run build` - Build for production
- `__PKG_MANAGER__ run start` - Start production server
- `__PKG_MANAGER__ run lint` - Run ESLint
- `__PKG_MANAGER__ run test` - Run tests

## API Endpoints

- `GET /healthz` - Liveness probe (always returns 200)
- `GET /readyz` - Readiness probe (checks database connection)
- `GET /docs` - Swagger API documentation (Fastify only)

## Project Structure

```
src/
├── index.ts          # Entry point
├── config/           # Environment configuration
├── app/              # Application setup
│   ├── plugins/      # Fastify plugins or Express middleware
│   └── routes/       # Route handlers
└── lib/              # Shared utilities
    ├── logger.ts     # Structured logger
    ├── db/           # Database client
    └── shutdown.ts   # Graceful shutdown
```

## License

Private
