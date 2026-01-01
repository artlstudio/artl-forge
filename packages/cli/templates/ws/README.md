# __PROJECT_NAME__

WebSocket server generated with [Artl Forge](https://github.com/artlstudio/artl-forge).

## Getting Started

1. Install dependencies:

```bash
__PKG_MANAGER__ install
```

2. Set up your environment:

```bash
cp .env.example .env
```

3. Start the server:

```bash
__PKG_MANAGER__ run dev
```

## Scripts

- `__PKG_MANAGER__ run dev` - Start server with hot reload
- `__PKG_MANAGER__ run build` - Build for production
- `__PKG_MANAGER__ run start` - Start production server
- `__PKG_MANAGER__ run lint` - Run ESLint
- `__PKG_MANAGER__ run test` - Run tests

## Endpoints

- `ws://localhost:3000` - WebSocket endpoint
- `GET /healthz` - Liveness probe
- `GET /readyz` - Readiness probe

## Project Structure

```
src/
├── index.ts          # Entry point
├── config/           # Environment configuration
├── lib/              # Shared utilities
│   └── logger.ts     # Structured logger
├── http/             # HTTP server for health endpoints
│   └── routes/
└── socket/           # Socket.io configuration
    ├── index.ts      # Socket server setup
    ├── auth.ts       # Authentication middleware
    └── handlers/     # Event handlers
```

## Socket Events

### Client → Server

- `message` - Send a message
- `join-room` - Join a room
- `leave-room` - Leave a room

### Server → Client

- `message` - Receive a message
- `user-joined` - User joined a room
- `user-left` - User left a room

## License

Private
