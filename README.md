<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,5,30&height=180&section=header&text=Pok%C3%A9mon%20Stadium%20Frontend&fontSize=36&fontColor=fff&animation=fadeIn&fontAlignY=32" />

<div align="center">

![Build](https://img.shields.io/github/actions/workflow/status/jarero321/pokemon-stadium-front/ci.yml?branch=develop&style=for-the-badge)
![License](https://img.shields.io/badge/Licencia-MIT-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)

**Cliente web de batallas Pokemon en tiempo real con sprites animados, sistema de turnos y diseno Stadium Midnight.**

[Inicio Rapido](#inicio-rapido) •
[Reglas de Negocio](#reglas-de-negocio) •
[Arquitectura](#arquitectura) •
[Sistema de Diseno](#sistema-de-diseno) •
[Pantallas](#pantallas) •
[Testing](#testing)

</div>

---

## Hola! 👋

Soy Carlos, y este es el frontend de mi prueba tecnica para **Sr. Fullstack Developer**.

### Mi enfoque con el frontend

La tentacion en una prueba tecnica es hacer algo "bonito" rapido y entregar. Yo hice lo contrario: **primero la arquitectura, despues la UI**.

Empece con **Storybook**. Antes de conectar un solo WebSocket, cada componente ya estaba documentado visualmente, con sus variantes, sus estados, y sus edge cases. Esto me permitio refinar la experiencia de batalla sin tener que correr el backend cada vez. Cuando llego el momento de integrar, todo encajo porque los componentes ya estaban probados en aislamiento.

### Por que Stadium Midnight

Necesitaba un sistema de diseno que funcionara para un juego de batallas. Los temas claros no transmiten la intensidad de un combate Pokemon. Asi que disene **Stadium Midnight**: una paleta de superficies oscuras con un unico color de marca (violet) que guia la atencion del jugador. La regla es simple: entrecierra los ojos mirando cualquier pantalla y solo deberias ver dos familias de color — neutrales oscuros y violet. Los colores de estado (verde para HP seguro, amber para precaucion, rose para peligro) aparecen solo cuando hay algo que comunicar.

No es pixel-perfect todavia. Pero la base esta solida y escalar la UI es cuestion de iterar sobre componentes que ya existen.

### El sistema de recuperacion ante desync

Este es el detalle que separa un demo de un producto real. En un juego con WebSockets, las cosas se desconectan: hot reload en desarrollo, cambio de pestana en mobile, red inestable. Si el cliente pierde un evento `BATTLE_START` o `BATTLE_END`, el juego se rompe.

La solucion: **todo el estado de la vista se deriva de los stores**. No hay navegacion imperativa. Cuando el socket se reconecta, el servidor manda `LOBBY_STATUS` con el estado completo, y el cliente se reconstruye solo. Si un `forcedSwitchPending` se pierde, se re-deriva del estado del equipo (Pokemon activo con HP 0 + alternativas vivas). Si `pendingAction` queda stuck, se limpia en disconnect.

Hay tests dedicados a probar estos escenarios de desync: hot reload, disconnect del server, pending actions stuck, forced switch perdido, y batalla que termina mientras estas desconectado.

### Mas alla del spec

- **Efectividad de tipos visual**: Popups de dano con colores y tamanos proporcionales a la efectividad
- **Animaciones de batalla completas**: Pokeball lanzada → sprite aparece → ataque → dano con shake → derrota con caida
- **Confetti de victoria**: canvas-confetti con 100 particulas en 2 oleadas (burst + cascade), paleta dorada, 5 formas
- **Timer de turno**: 15s con ataque automatico al expirar, anillo visual que cambia de violet → amber → rose
- **Internacionalizacion**: Ingles y espanol con auto-deteccion del navegador
- **Leaderboard**: Top 10 con medallas gold/silver/bronze para top 3

Todo esto fue posible gracias a un servidor de Minecraft con mi hermano (mod de Pokemon incluido) y una cantidad irresponsable de cafe ☕

**Contacto**: jareroluis@gmail.com | +52 476 150 9858

---

## Contexto del Proyecto

Prueba tecnica **Sr. Fullstack Developer** — cliente web para el sistema de batallas Pokemon en tiempo real. Requisitos clave:

- **Al primer inicio**, la vista solicita la URL del backend (ej: `http://192.168.X.X:8080`)
- La URL se almacena localmente y se usa para todas las peticiones
- **No requiere recompilacion** para cambiar la URL
- Elementos visuales que simulen la experiencia de batalla, estado del lobby e interacciones

### Configuracion de URL del Backend

| Modo           | Metodo                                    | Almacenamiento |
| :------------- | :---------------------------------------- | :------------- |
| **Desarrollo** | Pantalla de input al primer inicio        | `localStorage` |
| **Produccion** | Variable de entorno `NEXT_PUBLIC_API_URL` | Build-time     |

El reviewer puede:

1. Levantar el backend localmente
2. Abrir la app web
3. Ingresar su IP local
4. Probar el flujo completo

---

## Decisiones Tecnicas

| Decision                                                                | Por que                                                                                                                                                                                                                                                  |
| :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 16 con App Router**                                           | Turbopack para desarrollo rapido, server components donde tienen sentido, y el ecosistema de React 19 ya maduro.                                                                                                                                         |
| **Zustand sobre Redux/Context**                                         | 4 stores pequenos y enfocados. Sin boilerplate, sin providers anidados, sin acciones ni reducers. `connectionStore`, `lobbyStore`, `battleStore`, `viewStore` — cada uno con una responsabilidad clara.                                                  |
| **Framer Motion para animaciones**                                      | Las animaciones de batalla no son decorativas, son informacion. El jugador necesita ver que ataco, que recibio dano, que un Pokemon cayo. Framer Motion permite encadenar animaciones (attack → damage → faint) con timing tokens precisos.              |
| **Tailwind CSS 4 con `@utility`**                                       | Utility-first para iterar rapido en la UI. Las clases custom con `@utility` mantienen la consistencia del sistema de diseno sin CSS modules ni styled-components.                                                                                        |
| **Socket.IO Client**                                                    | Match directo con el backend. Reconexion automatica, manejo de eventos tipado, y la misma instancia compartida entre hooks via stores.                                                                                                                   |
| **Storybook 10 con Playwright**                                         | Documentacion visual que no miente. Si el componente se ve bien en Storybook, se ve bien en la app. Cada estado, cada variante, todo visible sin correr el backend.                                                                                      |
| **Clean Architecture (Domain/Application/Infrastructure/Presentation)** | Los stores y hooks no saben que Socket.IO existe. Los componentes no saben que Zustand existe (solo consumen hooks). Cambiar de Socket.IO a otro transport es cambiar un archivo en infrastructure.                                                      |
| **Vista derivada de stores**                                            | Cero `router.push()`. La pantalla que ves es una funcion pura del estado: si hay nickname → lobby, si hay lobby con 2 players → ready, si status es battling → battle, si hay winner → result. Esto hace que la recuperacion ante desync sea automatica. |

---

## Reglas de Negocio

### Flujo del Jugador

1. Ingresar al lobby con un **nickname** de entrenador
2. Recibir **3 Pokemon aleatorios** del catalogo (sin repetir entre jugadores)
3. Confirmar que esta **listo** (ready)
4. Batallar hasta que alguien gane

### Estados del Lobby

```
WAITING → READY → BATTLING → FINISHED
```

### Batalla

- El **primer turno** se asigna al Pokemon con mayor Speed
- Los turnos son **estrictamente secuenciales**
- Los ataques se disparan con un boton en el cliente y se procesan en el servidor
- **Dano** = `ATK atacante - DEF defensor` (minimo 1, 0 si inmune)
- Cuando un Pokemon llega a **HP 0**, el siguiente entra automaticamente
- Sin Pokemon restantes → **fin de batalla y ganador declarado**

### Notificaciones Visuales

La app notifica visualmente cuando:

- La batalla inicia
- Se resuelve un turno (dano y HP restante)
- Un Pokemon es derrotado
- Un nuevo Pokemon entra en batalla
- La batalla termina con un ganador

---

## Que se implemento

| Caracteristica                    | Descripcion                                                                            |
| :-------------------------------- | :------------------------------------------------------------------------------------- |
| **Batallas en Tiempo Real**       | Combate via WebSocket con sprites animados, barras de HP y popups de dano              |
| **Animaciones de Batalla**        | Cadenas attack → damage → faint con Framer Motion y timing tokens                      |
| **Stadium Midnight UI**           | Identidad violet, jerarquia de 5 superficies oscuras, inspiracion Apple                |
| **Recuperacion ante Desconexion** | Estado preservado en hot reload; LOBBY_STATUS recupera started/finished/forcedSwitch   |
| **Clean Architecture**            | Domain → Application → Infrastructure → Presentation con regla de dependencia estricta |
| **Internacionalizacion**          | Ingles + Espanol con auto-deteccion y persistencia en localStorage                     |
| **URL Backend Configurable**      | Configurable en runtime sin recompilacion                                              |
| **Confetti de Victoria**          | 100 particulas en 2 oleadas (burst + cascade), paleta dorada, 5 tipos de forma         |
| **Timer de Turno**                | 15s por turno con ataque automatico al expirar                                         |
| **Switch Forzado**                | UI dedicada cuando un Pokemon es derrotado y hay alternativas vivas                    |
| **Leaderboard**                   | Top 10 jugadores con win rate, gold/silver/bronze para top 3                           |
| **Storybook**                     | Documentacion visual de componentes con Playwright                                     |

## Tech Stack

<div align="center">

**Lenguajes y Frameworks**

<img src="https://skillicons.dev/icons?i=ts,react,nextjs,tailwind&perline=8" alt="languages" />

**Infraestructura y Herramientas**

<img src="https://skillicons.dev/icons?i=pnpm,githubactions,storybook&perline=8" alt="infra" />

</div>

| Tecnologia             | Proposito                                           |
| :--------------------- | :-------------------------------------------------- |
| **Next.js 16**         | App Router con Turbopack                            |
| **React 19**           | Rendering con hooks modernos                        |
| **Tailwind CSS 4**     | Styling utility-first con `@utility` custom classes |
| **Zustand 5**          | State management ligero (4 stores)                  |
| **Socket.IO Client 4** | Comunicacion WebSocket en tiempo real               |
| **Framer Motion 12**   | Animaciones de batalla y transiciones               |
| **Vitest**             | Testing unitario e integracion                      |
| **Storybook 10**       | Documentacion visual de componentes                 |

## Inicio Rapido

### Prerequisitos

- Node.js >= 22
- pnpm
- Backend [Pokemon Stadium API](https://github.com/jarero321/pokemon-stadium-api) corriendo

### Instalacion

```bash
# Clonar e instalar
git clone https://github.com/jarero321/pokemon-stadium-front.git
cd pokemon-stadium-front
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

Abrir `http://localhost:3000`. En modo desarrollo, se solicitara la URL del backend (ej: `http://localhost:8080`).

### Build de Produccion

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
│   └── constants.ts             # Timeouts, buffers de animacion
├── application/                 # Logica de negocio — depende solo de domain
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
└── app/                         # Next.js App Router paginas
    ├── register/page.tsx
    ├── lobby/page.tsx
    ├── ready/page.tsx
    ├── battle/page.tsx
    └── result/page.tsx
```

**Regla de dependencia**: `domain ← application ← infrastructure ← presentation`. Los tipos compartidos entre capas viven en `domain/dtos/`.

### Gestion de Estado

| Store             | Responsabilidad                                            |
| :---------------- | :--------------------------------------------------------- |
| `connectionStore` | URL, token, estado de conexion, acciones pendientes        |
| `lobbyStore`      | Datos del lobby, `getMyPlayer()`, `isMyTurn()`             |
| `battleStore`     | Eventos, animaciones, ganador, forcedSwitchPending         |
| `viewStore`       | `useCurrentView()` derivado → rutea a la pantalla correcta |

El routing de vistas es **completamente derivado** del estado de los stores — sin navegacion imperativa.

### Recuperacion ante Desconexion (Hot Reload)

| Escenario                     | Comportamiento                                             |
| :---------------------------- | :--------------------------------------------------------- |
| Hot reload durante batalla    | Estado preservado en stores, LOBBY_STATUS re-sincroniza    |
| BATTLE_START perdido          | `started` se infiere de `lobby.status === BATTLING`        |
| BATTLE_END perdido            | `finished + winner` se recuperan de `lobby.winner`         |
| `pendingAction` stuck         | Se limpia en disconnect, LOBBY_STATUS lo resetea           |
| `forcedSwitchPending` perdido | Se deriva del estado del equipo (Pokemon activo derrotado) |
| Disconnect del servidor       | Status error, credenciales preservadas para reconexion     |

## Sistema de Diseno

La app usa el sistema **Stadium Midnight** con un unico color de marca.

### Paleta de Colores

| Rol             | Color               | Uso                                                          |
| :-------------- | :------------------ | :----------------------------------------------------------- |
| **Marca**       | `#8B5CF6` (Violet)  | Identidad del jugador, CTAs, focus rings, indicador de turno |
| **Oponente**    | `#F43F5E` (Rose)    | Identidad del oponente solo en contexto de batalla           |
| **Exito**       | `#10B981` (Emerald) | HP seguro, victorias, acciones confirmadas                   |
| **Advertencia** | `#F59E0B` (Amber)   | HP precaucion, timer de turno bajo                           |
| **Peligro**     | `#F43F5E` (Rose)    | HP critico, errores                                          |

### Jerarquia de Superficies

```
#04060E  Base (fondo html)
#080C14  Fondo de pagina
#0B1020  Card mas baja
#0F1420  Card primaria (default)
#161D2E  Card elevada / hover
#1E2940  Bordes
#2A3A5C  Bordes interactivos
```

### El Test del Un Solo Color

> Entrecierra los ojos mirando cualquier pantalla. Deberias ver exactamente dos familias de color: neutrales oscuros y violet. Los colores de estado aparecen solo cuando hay un estado que comunicar.

Documentacion completa: [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)

## Pantallas

| Pantalla      | Descripcion                                                                               |
| :------------ | :---------------------------------------------------------------------------------------- |
| **Registro**  | Input de nickname, stats del jugador si ya existe, panel de leaderboard                   |
| **Lobby**     | Spinner de matchmaking, indicador de pasos, deteccion de oponente                         |
| **Ready**     | Revision de equipo con cards coloreadas por tipo, countdown de 20s, divisor VS            |
| **Batalla**   | Arena con sprites animados, barras HP, timer de turno, menu de acciones, caja de mensajes |
| **Resultado** | Overlay victoria/derrota con confetti dorado (100 particulas), stats animados             |

### HUD de Batalla

- **Barra de turno**: Pulso violet cuando es tu turno, neutral cuando es del oponente
- **Caja de mensajes**: Efecto de escritura a 28ms/char, click para saltar
- **Menu de acciones**: Boton Luchar (rose) + Pokemon (violet), cards de switch forzado
- **Anillo countdown**: Violet → amber → rose segun el tiempo restante
- **Popup de dano**: Tamano proporcional al dano, colores por efectividad

### Animaciones de Batalla

| Animacion | Descripcion                             | Duracion                    |
| :-------- | :-------------------------------------- | :-------------------------- |
| Entering  | Pokeball lanzada → sprite aparece       | Pokeball 0.6s + sprite fade |
| Attacking | Lunge hacia el oponente                 | 0.15s ease-attack           |
| Damage    | Shake + flash de opacidad               | 0.5s ease-out               |
| Critical  | Shake mas intenso con 8 keyframes       | 0.5s ease-out               |
| Fainting  | Caida + fade out                        | 0.9s ease-ko                |
| HP Ghost  | Barra fantasma desliza despues del dano | 1s ease-out                 |

## Testing

```bash
# Tests unitarios + integracion (129 tests)
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
| Connection Store  |     7 | Gestion de tokens, independencia de estado                              |
| Lobby Store       |    14 | setLobby, getMyPlayer, getOpponent, isMyTurn                            |
| Battle Store      |    12 | Resultados de turno, pokemon derrotado, switch forzado, fin de batalla  |
| View Store        |    10 | Vista derivada de 3 stores (nickname → lobby → ready → battle → result) |
| useBattle         |     9 | Guards de attack/switch (turno, pending, conexion)                      |
| useLobby          |     6 | Join, assign, ready con guards de conexion                              |
| useCountdown      |     8 | Decremento del timer, expiracion, progreso                              |
| useSocket         |     9 | Los 7 eventos del servidor + manejo de errores                          |
| Auth Flow         |    12 | Ciclo register → save → connect → request → exit                        |
| Socket Desync     |    30 | Recuperacion hot reload, reconexion, coherencia de estado               |
| HTTP/Socket Infra |    12 | Paso de tokens, opciones de conexion                                    |

**Total: 129 tests**

## Scripts

| Comando          | Descripcion                                 |
| :--------------- | :------------------------------------------ |
| `pnpm dev`       | Servidor de desarrollo con Turbopack        |
| `pnpm build`     | Build de produccion                         |
| `pnpm start`     | Iniciar servidor de produccion              |
| `pnpm test`      | Ejecutar todos los tests                    |
| `pnpm typecheck` | Verificacion de tipos TypeScript            |
| `pnpm lint`      | ESLint                                      |
| `pnpm format`    | Prettier                                    |
| `pnpm storybook` | Documentacion de componentes en puerto 6006 |

## Deployment (AWS Amplify)

El frontend se despliega automaticamente en **AWS Amplify Hosting** con soporte SSR (Next.js). La infraestructura se define en el repo del backend (`pokemon-stadium-api/infra/lib/frontend-stack.ts`) usando AWS CDK.

### Como funciona

```
Push a main → Amplify detecta cambio → Build (pnpm build) → Deploy SSR
```

- **Build**: Amplify ejecuta `pnpm install --frozen-lockfile` + `pnpm build`
- **Env vars**: `NEXT_PUBLIC_API_URL` se inyecta automaticamente desde CDK (apunta al ALB del backend)
- **Cache**: `node_modules/` y `.next/cache/` se cachean entre builds
- **SSR**: Next.js 16 App Router con server components y Turbopack

### Configuracion manual (sin CDK)

Si prefieres deployar sin CDK, puedes usar Amplify directamente:

1. Conectar el repo de GitHub en la consola de Amplify
2. Framework: **Next.js - SSR**
3. Build settings: usar el `buildSpec` del stack CDK
4. Variable de entorno: `NEXT_PUBLIC_API_URL=https://tu-alb-dns.amazonaws.com`

### CI/CD

| Trigger          | Pipeline               | Acciones                           |
| :--------------- | :--------------------- | :--------------------------------- |
| Push a `develop` | GitHub Actions CI      | Typecheck, Lint, Unit Tests, Build |
| Push a `main`    | AWS Amplify Auto-build | Build Next.js SSR + Deploy         |

## Licencia

Este proyecto esta licenciado bajo la Licencia MIT.

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,5,30&height=120&section=footer" />
