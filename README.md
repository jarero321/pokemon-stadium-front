<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,5,30&height=180&section=header&text=Pok%C3%A9mon%20Stadium%20Frontend&fontSize=36&fontColor=fff&animation=fadeIn&fontAlignY=32" />

<div align="center">

![Build](https://img.shields.io/github/actions/workflow/status/jarero321/pokemon-stadium-front/ci.yml?branch=develop&style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)

**Real-time Pokémon battle client with animated sprites, turn-based combat UI, and the Stadium Midnight design system.**

[Getting Started](#getting-started) •
[Architecture](#architecture) •
[Design System](#design-system) •
[Screens](#screens) •
[Testing](#testing)

</div>

---

## Features

| Feature                      | Description                                                                             |
| :--------------------------- | :-------------------------------------------------------------------------------------- |
| **Real-time Battles**        | WebSocket-driven combat with animated sprites, HP bars, and damage popups               |
| **Battle Animations**        | Chained attack → damage → faint sequences with Framer Motion                            |
| **Stadium Midnight UI**      | Violet brand identity, 5-level dark surface hierarchy, Apple-inspired design            |
| **Reconnection Recovery**    | State preserved across hot reloads; LOBBY_STATUS recovers started/finished/forcedSwitch |
| **Clean Architecture**       | Domain → Application → Infrastructure → Presentation with strict dependency rule        |
| **Internationalization**     | English + Spanish with auto-detection and localStorage persistence                      |
| **Configurable Backend URL** | Runtime-configurable server URL without recompilation                                   |
| **Storybook**                | Visual component documentation with Playwright browser tests                            |

## Tech Stack

<div align="center">

**Languages & Frameworks**

<img src="https://skillicons.dev/icons?i=ts,react,nextjs,tailwind&perline=8" alt="languages" />

**Infrastructure & Tools**

<img src="https://skillicons.dev/icons?i=pnpm,githubactions,storybook&perline=8" alt="infra" />

</div>

| Technology             | Purpose                                              |
| :--------------------- | :--------------------------------------------------- |
| **Next.js 16**         | App Router with Turbopack                            |
| **React 19**           | UI rendering with latest hooks                       |
| **Tailwind CSS 4**     | Utility-first styling with `@utility` custom classes |
| **Zustand 5**          | Lightweight state management (4 stores)              |
| **Socket.IO Client 4** | Real-time WebSocket communication                    |
| **Framer Motion 12**   | Battle animations and page transitions               |
| **Vitest**             | Unit and integration testing                         |
| **Storybook 10**       | Component visual documentation                       |

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm
- Running [Pokemon Stadium API](https://github.com/jarero321/pokemon-stadium-api) backend

### Installation

```bash
# Clone and install
git clone https://github.com/jarero321/pokemon-stadium-front.git
cd pokemon-stadium-front
pnpm install

# Start dev server
pnpm dev
```

Open `http://localhost:3000`. In development mode, you'll be prompted for the backend URL (e.g. `http://localhost:8080`).

### Production Build

```bash
# Set backend URL at build time
NEXT_PUBLIC_API_URL=https://your-api.example.com pnpm build
pnpm start
```

### Backend URL Configuration

| Mode            | Method                        | Storage        |
| :-------------- | :---------------------------- | :------------- |
| **Development** | Input screen on first launch  | `localStorage` |
| **Production**  | `NEXT_PUBLIC_API_URL` env var | Build-time     |

No recompilation needed to change the backend URL.

## Architecture

```
src/
├── domain/                      # Pure types — zero framework dependencies
│   ├── dtos/                    # LobbyDTO, BattleDTO, UITypes
│   ├── enums/                   # LobbyStatus
│   ├── events/                  # ClientEvent, ServerEvent
│   ├── errors/                  # ErrorClassification, ServerError
│   └── constants.ts             # Timeouts, animation buffers
├── application/                 # Business logic — depends on domain only
│   ├── hooks/                   # useBattle, useSocket, useBattleAnimation...
│   ├── stores/                  # connectionStore, lobbyStore, battleStore, viewStore
│   └── ports/                   # ISocketClient, IHttpClient, IStorage
├── infrastructure/              # Implementations — depends on ports
│   ├── http/                    # FetchHttpClient
│   ├── socket/                  # SocketIOClient
│   └── storage/                 # LocalStorageClient
├── presentation/                # UI — depends on everything
│   ├── components/
│   │   ├── battle/              # BattleArena, PokemonSprite, StatBar, VictoryOverlay...
│   │   ├── ui/                  # ConnectionDot, CountdownRing, GameNotification...
│   │   ├── *Screen.tsx          # Smart containers (BattleScreen, LobbyScreen...)
│   │   └── *ScreenView.tsx      # Pure views (presentational)
│   └── providers/               # GameProvider (composition root + context)
├── lib/
│   ├── i18n/                    # LanguageProvider, en.ts, es.ts
│   └── tokens.ts                # Design tokens, easing curves, colors
└── app/                         # Next.js App Router pages
    ├── register/page.tsx
    ├── lobby/page.tsx
    ├── ready/page.tsx
    ├── battle/page.tsx
    └── result/page.tsx
```

**Dependency rule**: `domain ← application ← infrastructure ← presentation`. Types shared between layers live in `domain/dtos/`.

### State Management

| Store             | Responsibility                                        |
| :---------------- | :---------------------------------------------------- |
| `connectionStore` | URL, token, connection status, pending actions        |
| `lobbyStore`      | Lobby data, `getMyPlayer()`, `isMyTurn()`             |
| `battleStore`     | Events, animations, winner, forcedSwitchPending       |
| `viewStore`       | Derived `useCurrentView()` → routes to correct screen |

View routing is **fully derived** from store state — no imperative navigation.

## Design System

The app uses the **Stadium Midnight** design system with a single brand color.

### Color Palette

| Role         | Color               | Usage                                              |
| :----------- | :------------------ | :------------------------------------------------- |
| **Brand**    | `#8B5CF6` (Violet)  | Player identity, CTAs, focus rings, turn indicator |
| **Opponent** | `#F43F5E` (Rose)    | Opponent identity in battle context only           |
| **Success**  | `#10B981` (Emerald) | HP safe, wins, confirmed actions                   |
| **Warning**  | `#F59E0B` (Amber)   | HP caution, turn timer low                         |
| **Danger**   | `#F43F5E` (Rose)    | HP critical, errors                                |

### Surface Hierarchy

```
#04060E  Base (html background)
#080C14  Page background
#0B1020  Lowest card
#0F1420  Primary card (default)
#161D2E  Elevated card / hover
#1E2940  Borders
#2A3A5C  Interactive borders
```

### The One Color Test

> Squint at any screen. You should see exactly two hue families: dark neutrals and violet. Status colors appear only when there is status to communicate.

Full design system documentation: [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)

## Screens

| Screen       | Description                                                                |
| :----------- | :------------------------------------------------------------------------- |
| **Register** | Nickname input, player stats, leaderboard panel                            |
| **Lobby**    | Matchmaking spinner, step indicator, opponent detection                    |
| **Ready**    | Team review with type-colored cards, 20s countdown, VS divider             |
| **Battle**   | Arena with animated sprites, HP bars, turn timer, action menu, message box |
| **Result**   | Victory/defeat overlay with gold confetti (100 particles), animated stats  |

### Battle HUD

- **Turn bar**: Violet pulse when your turn, neutral when opponent's
- **Message box**: Typing effect at 28ms/char, click-to-skip
- **Action menu**: Fight (rose) + Pokémon (violet) buttons, forced switch cards
- **Countdown ring**: Violet → amber → rose as time runs out

## Testing

```bash
# Unit + integration tests (129 tests)
pnpm test

# Watch mode
pnpm test:watch

# Type checking
pnpm typecheck

# Storybook
pnpm storybook
```

### Test Coverage

| Suite             | Tests | Scope                                                                   |
| :---------------- | ----: | :---------------------------------------------------------------------- |
| Connection Store  |     7 | Token management, state independence                                    |
| Lobby Store       |    14 | setLobby, getMyPlayer, getOpponent, isMyTurn                            |
| Battle Store      |    12 | Turn results, pokemon defeated, forced switch, battle end               |
| View Store        |    10 | Derived view from 3 stores (nickname → lobby → ready → battle → result) |
| useBattle         |     9 | Attack/switch guards (turn, pending, connection)                        |
| useLobby          |     6 | Join, assign, ready with connection guards                              |
| useCountdown      |     8 | Timer decrement, expiry, progress                                       |
| useSocket         |     9 | All 7 server events + error handling                                    |
| Auth Flow         |    12 | Register → save → connect → request → exit lifecycle                    |
| Socket Desync     |    30 | Hot reload recovery, reconnection, state coherence                      |
| HTTP/Socket Infra |    12 | Token passing, connection options                                       |

## Scripts

| Command          | Description                     |
| :--------------- | :------------------------------ |
| `pnpm dev`       | Start dev server with Turbopack |
| `pnpm build`     | Production build                |
| `pnpm start`     | Start production server         |
| `pnpm test`      | Run all tests                   |
| `pnpm typecheck` | TypeScript type checking        |
| `pnpm lint`      | ESLint                          |
| `pnpm format`    | Prettier                        |
| `pnpm storybook` | Component docs at port 6006     |

## License

This project is licensed under the MIT License.

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,5,30&height=120&section=footer" />
