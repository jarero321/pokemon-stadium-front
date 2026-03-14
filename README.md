# Pokémon Stadium Lite — Frontend

> Real-time battle client — Next.js · React · Socket.IO · Zustand

![Next.js](https://img.shields.io/badge/next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/react-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/typescript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Socket.IO](https://img.shields.io/badge/socket.io-4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — the app will prompt you for the backend URL on first launch.

## Server URL Configuration

On first launch in **development mode**, the app shows a setup screen to enter the backend URL (e.g. `http://192.168.1.100:8080`). The URL is:

- Stored in `localStorage` — persists across sessions
- Used for all REST and WebSocket connections
- No recompilation needed to change it

In **production**, the URL is set at build time via the `NEXT_PUBLIC_API_URL` environment variable.

## Architecture

```
src/
├── app/                  Next.js app directory (layout, pages, CSS)
├── application/
│   ├── hooks/            Game hooks (useBattle, useLobby, useSocket)
│   ├── stores/           Zustand stores (lobby, battle, connection, view)
│   └── ports/            Interfaces for infrastructure
├── domain/
│   ├── dtos/             Data transfer objects
│   ├── events/           Socket event enums
│   ├── enums/            Domain enums
│   └── errors/           Error classification
├── infrastructure/
│   ├── http/             Fetch HTTP client
│   ├── socket/           Socket.IO client
│   └── storage/          LocalStorage client
├── presentation/
│   ├── components/       UI components (screens, battle, ui)
│   └── providers/        GameProvider (dependency injection)
└── lib/
    ├── i18n/             Internationalization (en/es)
    └── tokens.ts         Design tokens
```

## Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `pnpm dev`       | Start development server |
| `pnpm build`     | Production build         |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint`      | ESLint                   |
| `pnpm test`      | Unit tests               |
| `pnpm test:e2e`  | End-to-end tests         |

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: HeroUI + Tailwind CSS 4 + Framer Motion
- **State**: Zustand (derived views, no imperative state sync)
- **WebSocket**: Socket.IO Client
- **i18n**: Custom provider (English / Spanish)
- **Testing**: Vitest
- **Storybook**: Component documentation

## Requirements

- Node.js 22+
- pnpm
- Backend running on port 8080 (see [pokemon-stadium-api](https://github.com/jarero321/pokemon-stadium-api))
