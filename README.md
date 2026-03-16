<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,5,30&height=180&section=header&text=Pok%C3%A9mon%20Stadium%20Frontend&fontSize=36&fontColor=fff&animation=fadeIn&fontAlignY=32" />

<div align="center">

![Build](https://img.shields.io/github/actions/workflow/status/jarero321/pokemon-stadium-front/ci.yml?branch=develop&style=for-the-badge)
![License](https://img.shields.io/badge/Licencia-MIT-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)

**Cliente web de batallas Pokémon en tiempo real con sprites animados, sistema de turnos y diseño Stadium Midnight.**

[Inicio Rápido](#inicio-rápido) •
[Reglas de Negocio](#reglas-de-negocio) •
[Arquitectura](#arquitectura) •
[Sistema de Diseño](#sistema-de-diseño) •
[Pantallas](#pantallas) •
[Testing](#testing)

</div>

---

## Contexto del Proyecto

Prueba técnica **Sr. Fullstack Developer** — cliente web para el sistema de batallas Pokémon en tiempo real. Requisitos clave:

- **Al primer inicio**, la vista solicita la URL del backend (ej: `http://192.168.X.X:8080`)
- La URL se almacena localmente y se usa para todas las peticiones
- **No requiere recompilación** para cambiar la URL
- Elementos visuales que simulen la experiencia de batalla, estado del lobby e interacciones

### Configuración de URL del Backend

| Modo           | Método                                    | Almacenamiento |
| :------------- | :---------------------------------------- | :------------- |
| **Desarrollo** | Pantalla de input al primer inicio        | `localStorage` |
| **Producción** | Variable de entorno `NEXT_PUBLIC_API_URL` | Build-time     |

El reviewer puede:

1. Levantar el backend localmente
2. Abrir la app web
3. Ingresar su IP local
4. Probar el flujo completo

---

## Reglas de Negocio

### Flujo del Jugador

1. Ingresar al lobby con un **nickname** de entrenador
2. Recibir **3 Pokémon aleatorios** del catálogo (sin repetir entre jugadores)
3. Confirmar que está **listo** (ready)
4. Batallar hasta que alguien gane

### Estados del Lobby

```
WAITING → READY → BATTLING → FINISHED
```

### Batalla

- El **primer turno** se asigna al Pokémon con mayor Speed
- Los turnos son **estrictamente secuenciales**
- Los ataques se disparan con un botón en el cliente y se procesan en el servidor
- **Daño** = `ATK atacante - DEF defensor` (mínimo 1, 0 si inmune)
- Cuando un Pokémon llega a **HP 0**, el siguiente entra automáticamente
- Sin Pokémon restantes → **fin de batalla y ganador declarado**

### Notificaciones Visuales

La app notifica visualmente cuando:

- La batalla inicia
- Se resuelve un turno (daño y HP restante)
- Un Pokémon es derrotado
- Un nuevo Pokémon entra en batalla
- La batalla termina con un ganador

---

## Características Implementadas

| Característica                    | Descripción                                                                            |
| :-------------------------------- | :------------------------------------------------------------------------------------- |
| **Batallas en Tiempo Real**       | Combate via WebSocket con sprites animados, barras de HP y popups de daño              |
| **Animaciones de Batalla**        | Cadenas attack → damage → faint con Framer Motion y timing tokens                      |
| **Stadium Midnight UI**           | Identidad violet, jerarquía de 5 superficies oscuras, inspiración Apple                |
| **Recuperación ante Desconexión** | Estado preservado en hot reload; LOBBY_STATUS recupera started/finished/forcedSwitch   |
| **Clean Architecture**            | Domain → Application → Infrastructure → Presentation con regla de dependencia estricta |
| **Internacionalización**          | Inglés + Español con auto-detección y persistencia en localStorage                     |
| **URL Backend Configurable**      | Configurable en runtime sin recompilación                                              |
| **Confetti de Victoria**          | 100 partículas en 2 oleadas (burst + cascade), paleta dorada, 5 tipos de forma         |
| **Timer de Turno**                | 15s por turno con ataque automático al expirar                                         |
| **Switch Forzado**                | UI dedicada cuando un Pokémon es derrotado y hay alternativas vivas                    |
| **Leaderboard**                   | Top 10 jugadores con win rate, gold/silver/bronze para top 3                           |
| **Storybook**                     | Documentación visual de componentes con Playwright                                     |

## Tech Stack

<div align="center">

**Lenguajes y Frameworks**

<img src="https://skillicons.dev/icons?i=ts,react,nextjs,tailwind&perline=8" alt="languages" />

**Infraestructura y Herramientas**

<img src="https://skillicons.dev/icons?i=pnpm,githubactions,storybook&perline=8" alt="infra" />

</div>

| Tecnología             | Propósito                                           |
| :--------------------- | :-------------------------------------------------- |
| **Next.js 16**         | App Router con Turbopack                            |
| **React 19**           | Rendering con hooks modernos                        |
| **Tailwind CSS 4**     | Styling utility-first con `@utility` custom classes |
| **Zustand 5**          | State management ligero (4 stores)                  |
| **Socket.IO Client 4** | Comunicación WebSocket en tiempo real               |
| **Framer Motion 12**   | Animaciones de batalla y transiciones               |
| **Vitest**             | Testing unitario e integración                      |
| **Storybook 10**       | Documentación visual de componentes                 |

## Inicio Rápido

### Prerequisitos

- Node.js >= 22
- pnpm
- Backend [Pokemon Stadium API](https://github.com/jarero321/pokemon-stadium-api) corriendo

### Instalación

```bash
# Clonar e instalar
git clone https://github.com/jarero321/pokemon-stadium-front.git
cd pokemon-stadium-front
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

Abrir `http://localhost:3000`. En modo desarrollo, se solicitará la URL del backend (ej: `http://localhost:8080`).

### Build de Producción

```bash
# Definir URL del backend en build time
NEXT_PUBLIC_API_URL=https://tu-api.example.com pnpm build
pnpm start
```

## Arquitectura

```
src/
├── domain/                      # Tipos puros — cero dependencias de framework
│   ├── dtos/                    # LobbyDTO, BattleDTO, UITypes (SpriteAnimation, etc.)
│   ├── enums/                   # LobbyStatus
│   ├── events/                  # ClientEvent, ServerEvent
│   ├── errors/                  # ErrorClassification, ServerError
│   └── constants.ts             # Timeouts, buffers de animación
├── application/                 # Lógica de negocio — depende solo de domain
│   ├── hooks/                   # useBattle, useSocket, useBattleAnimation...
│   ├── stores/                  # connectionStore, lobbyStore, battleStore, viewStore
│   └── ports/                   # ISocketClient, IHttpClient, IStorage
├── infrastructure/              # Implementaciones — depende de ports
│   ├── http/                    # FetchHttpClient
│   ├── socket/                  # SocketIOClient
│   └── storage/                 # LocalStorageClient
├── presentation/                # UI — depende de todo
│   ├── components/
│   │   ├── battle/              # BattleArena, PokemonSprite, StatBar, VictoryOverlay...
│   │   ├── ui/                  # ConnectionDot, CountdownRing, GameNotification...
│   │   ├── *Screen.tsx          # Contenedores inteligentes (BattleScreen, LobbyScreen...)
│   │   └── *ScreenView.tsx      # Vistas presentacionales puras
│   └── providers/               # GameProvider (composition root + context)
├── lib/
│   ├── i18n/                    # LanguageProvider, en.ts, es.ts
│   └── tokens.ts                # Design tokens, curvas de easing, colores
└── app/                         # Next.js App Router páginas
    ├── register/page.tsx
    ├── lobby/page.tsx
    ├── ready/page.tsx
    ├── battle/page.tsx
    └── result/page.tsx
```

**Regla de dependencia**: `domain ← application ← infrastructure ← presentation`. Los tipos compartidos entre capas viven en `domain/dtos/`.

### Gestión de Estado

| Store             | Responsabilidad                                            |
| :---------------- | :--------------------------------------------------------- |
| `connectionStore` | URL, token, estado de conexión, acciones pendientes        |
| `lobbyStore`      | Datos del lobby, `getMyPlayer()`, `isMyTurn()`             |
| `battleStore`     | Eventos, animaciones, ganador, forcedSwitchPending         |
| `viewStore`       | `useCurrentView()` derivado → rutea a la pantalla correcta |

El routing de vistas es **completamente derivado** del estado de los stores — sin navegación imperativa.

### Recuperación ante Desconexión (Hot Reload)

| Escenario                     | Comportamiento                                             |
| :---------------------------- | :--------------------------------------------------------- |
| Hot reload durante batalla    | Estado preservado en stores, LOBBY_STATUS re-sincroniza    |
| BATTLE_START perdido          | `started` se infiere de `lobby.status === BATTLING`        |
| BATTLE_END perdido            | `finished + winner` se recuperan de `lobby.winner`         |
| `pendingAction` stuck         | Se limpia en disconnect, LOBBY_STATUS lo resetea           |
| `forcedSwitchPending` perdido | Se deriva del estado del equipo (Pokémon activo derrotado) |
| Disconnect del servidor       | Status error, credenciales preservadas para reconexión     |

## Sistema de Diseño

La app usa el sistema **Stadium Midnight** con un único color de marca.

### Paleta de Colores

| Rol             | Color               | Uso                                                          |
| :-------------- | :------------------ | :----------------------------------------------------------- |
| **Marca**       | `#8B5CF6` (Violet)  | Identidad del jugador, CTAs, focus rings, indicador de turno |
| **Oponente**    | `#F43F5E` (Rose)    | Identidad del oponente solo en contexto de batalla           |
| **Éxito**       | `#10B981` (Emerald) | HP seguro, victorias, acciones confirmadas                   |
| **Advertencia** | `#F59E0B` (Amber)   | HP precaución, timer de turno bajo                           |
| **Peligro**     | `#F43F5E` (Rose)    | HP crítico, errores                                          |

### Jerarquía de Superficies

```
#04060E  Base (fondo html)
#080C14  Fondo de página
#0B1020  Card más baja
#0F1420  Card primaria (default)
#161D2E  Card elevada / hover
#1E2940  Bordes
#2A3A5C  Bordes interactivos
```

### El Test del Un Solo Color

> Entrecierra los ojos mirando cualquier pantalla. Deberías ver exactamente dos familias de color: neutrals oscuros y violet. Los colores de estado aparecen solo cuando hay un estado que comunicar.

Documentación completa: [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)

## Pantallas

| Pantalla      | Descripción                                                                               |
| :------------ | :---------------------------------------------------------------------------------------- |
| **Registro**  | Input de nickname, stats del jugador si ya existe, panel de leaderboard                   |
| **Lobby**     | Spinner de matchmaking, indicador de pasos, detección de oponente                         |
| **Ready**     | Revisión de equipo con cards coloreadas por tipo, countdown de 20s, divisor VS            |
| **Batalla**   | Arena con sprites animados, barras HP, timer de turno, menú de acciones, caja de mensajes |
| **Resultado** | Overlay victoria/derrota con confetti dorado (100 partículas), stats animados             |

### HUD de Batalla

- **Barra de turno**: Pulso violet cuando es tu turno, neutral cuando es del oponente
- **Caja de mensajes**: Efecto de escritura a 28ms/char, click para saltar
- **Menú de acciones**: Botón Luchar (rose) + Pokémon (violet), cards de switch forzado
- **Anillo countdown**: Violet → amber → rose según el tiempo restante
- **Popup de daño**: Tamaño proporcional al daño, colores por efectividad

### Animaciones de Batalla

| Animación | Descripción                             | Duración                    |
| :-------- | :-------------------------------------- | :-------------------------- |
| Entering  | Pokeball lanzada → sprite aparece       | Pokeball 0.6s + sprite fade |
| Attacking | Lunge hacia el oponente                 | 0.15s ease-attack           |
| Damage    | Shake + flash de opacidad               | 0.5s ease-out               |
| Critical  | Shake más intenso con 8 keyframes       | 0.5s ease-out               |
| Fainting  | Caída + fade out                        | 0.9s ease-ko                |
| HP Ghost  | Barra fantasma desliza después del daño | 1s ease-out                 |

## Testing

```bash
# Tests unitarios + integración (129 tests)
pnpm test

# Watch mode
pnpm test:watch

# Type checking
pnpm typecheck

# Storybook
pnpm storybook
```

### Cobertura de Tests

| Suite             | Tests | Alcance                                                                 |
| :---------------- | ----: | :---------------------------------------------------------------------- |
| Connection Store  |     7 | Gestión de tokens, independencia de estado                              |
| Lobby Store       |    14 | setLobby, getMyPlayer, getOpponent, isMyTurn                            |
| Battle Store      |    12 | Resultados de turno, pokémon derrotado, switch forzado, fin de batalla  |
| View Store        |    10 | Vista derivada de 3 stores (nickname → lobby → ready → battle → result) |
| useBattle         |     9 | Guards de attack/switch (turno, pending, conexión)                      |
| useLobby          |     6 | Join, assign, ready con guards de conexión                              |
| useCountdown      |     8 | Decremento del timer, expiración, progreso                              |
| useSocket         |     9 | Los 7 eventos del servidor + manejo de errores                          |
| Auth Flow         |    12 | Ciclo register → save → connect → request → exit                        |
| Socket Desync     |    30 | Recuperación hot reload, reconexión, coherencia de estado               |
| HTTP/Socket Infra |    12 | Paso de tokens, opciones de conexión                                    |

**Total: 129 tests**

## Scripts

| Comando          | Descripción                                 |
| :--------------- | :------------------------------------------ |
| `pnpm dev`       | Servidor de desarrollo con Turbopack        |
| `pnpm build`     | Build de producción                         |
| `pnpm start`     | Iniciar servidor de producción              |
| `pnpm test`      | Ejecutar todos los tests                    |
| `pnpm typecheck` | Verificación de tipos TypeScript            |
| `pnpm lint`      | ESLint                                      |
| `pnpm format`    | Prettier                                    |
| `pnpm storybook` | Documentación de componentes en puerto 6006 |

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,5,30&height=120&section=footer" />
