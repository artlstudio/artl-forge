# __PROJECT_NAME__

Background worker generated with [Artl Forge](https://github.com/artlstudio/artl-forge).

## Getting Started

1. Install dependencies:

```bash
__PKG_MANAGER__ install
```

2. Set up your environment:

```bash
cp .env.example .env
```

3. Start the worker:

```bash
__PKG_MANAGER__ run dev
```

## Scripts

- `__PKG_MANAGER__ run dev` - Start worker with hot reload
- `__PKG_MANAGER__ run build` - Build for production
- `__PKG_MANAGER__ run start` - Start production worker
- `__PKG_MANAGER__ run lint` - Run ESLint
- `__PKG_MANAGER__ run test` - Run tests

## Project Structure

```
src/
├── index.ts          # Entry point
├── config/           # Environment configuration
├── lib/              # Shared utilities
│   └── logger.ts     # Structured logger
├── jobs/             # Job definitions
│   └── example.ts    # Example job
└── scheduler/        # Cron scheduler
    └── index.ts      # Schedule definitions
```

## Adding Jobs

1. Create a new job file in `src/jobs/`:

```typescript
export const myJob = {
  name: 'my-job',
  handler: async () => {
    // Job logic here
  },
};
```

2. Register the job in `src/scheduler/index.ts`:

```typescript
scheduler.add('0 * * * *', myJob); // Run every hour
```

## License

Private
