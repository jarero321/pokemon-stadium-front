# Pokemon Stadium — Battle HUD Design System

**Version 1.0 | March 2026**
Stack: Next.js 16 · React 19 · Framer Motion 12 · Tailwind CSS 4 · CSS Custom Properties

---

## Reality Check: What Actually Exists

Before prescribing fixes, it is worth stating what the audit found. The prompt describes `AttackEffect.tsx`, `PokemonSprite.tsx`, and `TYPE_COLORS` in TypeScript as existing inconsistencies. They do not exist yet. The battle UI (`BattleScreen.tsx`) is a functional MVP that uses raw Tailwind utility classes and no design system components at all. The design system CSS (`battle-design-system.css`) is complete and well-crafted but completely unwired — none of its component classes appear in the live JSX.

This changes the mandate. Instead of reconciling two conflicting color sets, the task is:

1. Declare the CSS custom properties as the single canonical source of truth (they already exist and are well-designed)
2. Build the token bridge to Framer Motion / TypeScript before writing any component
3. Specify the components BattleScreen needs, in the order they should be built
4. Define the choreography so animation decisions are made once, not per-component

---

## 1. Color System

### 1.1 Source of Truth Decision

**Use the CSS custom properties exclusively. Delete any future TYPE_COLORS TypeScript constant before it is written.**

Rationale:

- The CSS set uses Tailwind 4's native color palette values (sky-400, green-400, yellow-400, etc.), keeping the system internally consistent
- CSS custom properties are the only mechanism that can drive type-colored glows, platform rings, badge fills, and HP bar tints simultaneously from a single value
- Framer Motion inline styles and TypeScript logic can both read these at runtime via `getComputedStyle(document.documentElement).getPropertyValue('--type-fire')`
- A TypeScript constant is a second source that will inevitably drift; the CSS token never drifts because it is the renderer

### 1.2 Type Color Palette

All 18 types. Values are the canonical tokens in `battle-design-system.css :root`.

| Token             | Hex       | Tailwind Equivalent | Text on Token    | Usage                                    |
| ----------------- | --------- | ------------------- | ---------------- | ---------------------------------------- |
| `--type-normal`   | `#a8a29e` | stone-400           | dark (`#1a1a2e`) | Badge fill, platform glow                |
| `--type-fire`     | `#f97316` | orange-500          | white            | Badge fill, platform glow, blaze effect  |
| `--type-water`    | `#38bdf8` | sky-400             | dark             | Badge fill, platform glow, aqua effect   |
| `--type-grass`    | `#4ade80` | green-400           | dark             | Badge fill, platform glow                |
| `--type-electric` | `#facc15` | yellow-400          | dark (`#1a1a2e`) | Badge fill, platform glow, bolt effect   |
| `--type-ice`      | `#67e8f9` | cyan-300            | dark             | Badge fill, platform glow                |
| `--type-fighting` | `#fb923c` | orange-400          | dark             | Badge fill, platform glow                |
| `--type-poison`   | `#c084fc` | purple-400          | white            | Badge fill, platform glow, mystic effect |
| `--type-ground`   | `#d97706` | amber-600           | white            | Badge fill, platform glow                |
| `--type-flying`   | `#93c5fd` | blue-300            | dark             | Badge fill, platform glow                |
| `--type-psychic`  | `#e879f9` | fuchsia-400         | white            | Badge fill, platform glow, mystic effect |
| `--type-bug`      | `#84cc16` | lime-500            | dark             | Badge fill, platform glow                |
| `--type-rock`     | `#a8a29e` | stone-400           | dark             | Badge fill, platform glow                |
| `--type-ghost`    | `#7c3aed` | violet-600          | white            | Badge fill, platform glow, mystic effect |
| `--type-dragon`   | `#818cf8` | indigo-400          | white            | Badge fill, platform glow, blaze effect  |
| `--type-dark`     | `#6b7280` | gray-500            | white            | Badge fill, platform glow, mystic effect |
| `--type-steel`    | `#94a3b8` | slate-400           | dark             | Badge fill, platform glow                |
| `--type-fairy`    | `#f9a8d4` | pink-300            | dark (`#1a1a2e`) | Badge fill, platform glow, mystic effect |

**Accessibility note:** Types marked "dark" text require `color: #1a1a2e` on the badge. These are: normal, water, grass, electric, ice, flying, bug, rock, steel, fairy, and fighting. The design system CSS already handles this per `data-type` attribute. Any TypeScript component should not guess — it should set `data-type` and let CSS decide.

### 1.3 Semantic Color Tokens

These express state meaning, not type identity.

| Token             | Value     | Meaning                           | Where Used                                                   |
| ----------------- | --------- | --------------------------------- | ------------------------------------------------------------ |
| `--neon-player`   | `#38bdf8` | Player identity, my-turn, my-team | Info panel accent, turn indicator, switch card active border |
| `--neon-opponent` | `#f87171` | Opponent identity, danger, KO     | Info panel accent, battle log KO entries                     |
| `--neon-safe`     | `#4ade80` | HP above 50%                      | HP bar fill, HP label                                        |
| `--neon-warning`  | `#facc15` | HP between 20–50%                 | HP bar fill, HP label                                        |
| `--neon-danger`   | `#f87171` | HP below 20%, FIGHT button        | HP bar fill, HP label, battle-action-btn--fight              |

**HP threshold logic** (lives in a utility function, not hardcoded per-component):

```
hp > 0.50 * maxHp  →  --neon-safe    (#4ade80)
hp > 0.20 * maxHp  →  --neon-warning (#facc15)
hp <= 0.20 * maxHp →  --neon-danger  (#f87171)
```

### 1.4 Battle Log Semantic Colors

Message context colors already defined in `battle-design-system.css`. Repeated here for reference when building the typewriter component:

| Class                   | Color                  | Context             |
| ----------------------- | ---------------------- | ------------------- |
| `.battle-msg--super`    | `#fbbf24` (amber-400)  | Super effective hit |
| `.battle-msg--resisted` | `#93c5fd` (blue-300)   | Not very effective  |
| `.battle-msg--critical` | `#fb923c` (orange-400) | Critical hit        |
| `.battle-msg--ko`       | `#f87171` (red-400)    | Pokemon fainted     |
| `.battle-msg--victory`  | `#4ade80` (green-400)  | Battle won          |
| `.battle-msg--defeat`   | `#f87171` (red-400)    | Battle lost         |

### 1.5 Glass Morphism Surface Tokens

| Token                 | Value                       | Usage                            |
| --------------------- | --------------------------- | -------------------------------- |
| `--glass-bg`          | `rgba(12, 12, 28, 0.72)`    | Info panels, cards, HUD shell    |
| `--glass-bg-light`    | `rgba(255, 255, 255, 0.04)` | Switch cards, secondary surfaces |
| `--glass-border`      | `rgba(255, 255, 255, 0.10)` | Panel borders                    |
| `--glass-border-glow` | `rgba(255, 255, 255, 0.22)` | Top-edge highlight inset         |
| `--glass-blur`        | `12px`                      | backdrop-filter: blur() value    |

---

## 2. Typography Tokens

The design system CSS uses font sizes inline without tokens. These should be extracted for consistency. Add to `:root`:

| Token                | Value  | Usage                                |
| -------------------- | ------ | ------------------------------------ |
| `--text-badge`       | `9px`  | Type badge labels                    |
| `--text-stat-label`  | `8px`  | ATK / DEF / SPD labels in info panel |
| `--text-stat-value`  | `11px` | Stat numbers                         |
| `--text-hp-label`    | `9px`  | "HP" label                           |
| `--text-panel-name`  | `13px` | Pokemon name in info panel           |
| `--text-panel-level` | `10px` | Level indicator                      |
| `--text-msg`         | `15px` | Battle message box body text         |
| `--text-action-btn`  | `14px` | FIGHT / POKEMON button labels        |
| `--text-log-entry`   | `12px` | Battle log entries                   |

All font-weight values used: 600 (body), 700 (labels), 800 (names, stat values), 900 (action buttons). These need no tokens — keep them as Tailwind utilities.

---

## 3. Animation System

### 3.1 Duration Scale

A named scale prevents the 14-value scatter that currently exists. Every animation in the system pulls from this table. No hardcoded millisecond values anywhere.

| Token                | Value    | Named Use                                                 |
| -------------------- | -------- | --------------------------------------------------------- |
| `--t-instant`        | `60ms`   | Button press depression, immediate feedback               |
| `--t-micro`          | `120ms`  | Button lift/hover entry                                   |
| `--t-fast`           | `150ms`  | Badge hover scale, switch card hover slide, chevron slide |
| `--t-normal`         | `300ms`  | Switch card HP fill, turn indicator state change          |
| `--t-medium`         | `400ms`  | HP color transition, message text color change            |
| `--t-slow`           | `500ms`  | HP bar fill width (damage animation)                      |
| `--t-strike`         | `550ms`  | Strike / bolt attack effect total duration                |
| `--t-blaze`          | `700ms`  | Blaze / aqua attack effect total duration                 |
| `--t-mystic`         | `750ms`  | Mystic attack effect total duration                       |
| `--t-sprite-snap`    | `150ms`  | Sprite idle float transition                              |
| `--t-sprite-hit`     | `500ms`  | Sprite damage shake                                       |
| `--t-sprite-entry`   | `500ms`  | Sprite entering the field                                 |
| `--t-sprite-ko`      | `900ms`  | Sprite faint animation                                    |
| `--t-hp-ghost`       | `1000ms` | Ghost bar fade-out delay                                  |
| `--t-msg-advance`    | `1400ms` | Auto-advance to next message                              |
| `--t-btn-scan`       | `3000ms` | Button idle scan-line cycle                               |
| `--t-platform-pulse` | `3000ms` | Platform glow pulse cycle                                 |
| `--t-turn-pulse`     | `2000ms` | Turn indicator pulse cycle                                |

**Add to `:root` in `battle-design-system.css`:**

```css
--t-instant: 60ms;
--t-micro: 120ms;
--t-fast: 150ms;
--t-normal: 300ms;
--t-medium: 400ms;
--t-slow: 500ms;
--t-strike: 550ms;
--t-blaze: 700ms;
--t-mystic: 750ms;
--t-sprite-snap: 150ms;
--t-sprite-hit: 500ms;
--t-sprite-entry: 500ms;
--t-sprite-ko: 900ms;
--t-hp-ghost: 1000ms;
--t-msg-advance: 1400ms;
--t-btn-scan: 3000ms;
--t-platform-pulse: 3000ms;
--t-turn-pulse: 2000ms;
```

### 3.2 Easing Scale

Two easing functions currently exist in CSS. They need to also exist in TypeScript for Framer Motion.

| Token           | CSS Value                              | Framer Motion Array        | Character                                        |
| --------------- | -------------------------------------- | -------------------------- | ------------------------------------------------ |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)`    | `[0.34, 1.56, 0.64, 1]`    | Overshoot, spring-like. Buttons, pokemon entries |
| `--ease-snappy` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `[0.25, 0.46, 0.45, 0.94]` | Fast deceleration. State transitions, HP bar     |
| `--ease-attack` | `cubic-bezier(0.22, 1, 0.36, 1)`       | `[0.22, 1, 0.36, 1]`       | Explosive start, soft land. Attack effects       |
| `--ease-ko`     | `cubic-bezier(0.55, 0, 1, 0.45)`       | `[0.55, 0, 1, 0.45]`       | Gravity drop. Faint animations                   |

Add `--ease-attack` and `--ease-ko` to `:root`. They are missing from the current CSS.

**The TypeScript bridge — create this file at `/src/lib/tokens.ts`:**

```typescript
// Single source of truth for animation tokens shared between CSS and Framer Motion.
// Values MUST match battle-design-system.css :root exactly.
// If you change CSS, change here. If you change here, change CSS.

export const EASE = {
  bounce: [0.34, 1.56, 0.64, 1] as const,
  snappy: [0.25, 0.46, 0.45, 0.94] as const,
  attack: [0.22, 1, 0.36, 1] as const,
  ko: [0.55, 0, 1, 0.45] as const,
} satisfies Record<string, readonly [number, number, number, number]>;

export const DURATION = {
  instant: 0.06,
  micro: 0.12,
  fast: 0.15,
  normal: 0.3,
  medium: 0.4,
  slow: 0.5,
  strike: 0.55,
  blaze: 0.7,
  mystic: 0.75,
  spriteSnap: 0.15,
  spriteHit: 0.5,
  spriteEntry: 0.5,
  spriteKo: 0.9,
  hpGhost: 1.0,
  msgAdvance: 1.4,
  btnScan: 3.0,
  platformPulse: 3.0,
  turnPulse: 2.0,
} satisfies Record<string, number>;

// Runtime type color reader — use this instead of a TYPE_COLORS constant.
// Returns the computed hex value of a CSS type token.
export function getTypeColor(type: string): string {
  if (typeof window === 'undefined') return '#a8a29e'; // SSR fallback
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--type-${type.toLowerCase()}`)
    .trim();
}
```

### 3.3 Animation Categories

**Micro — hover, focus, press (under 200ms, reversible)**

| Animation            | Duration Token | Easing          | What Moves                         |
| -------------------- | -------------- | --------------- | ---------------------------------- |
| Button hover lift    | `--t-micro`    | `--ease-snappy` | translateY(-2px), border brightens |
| Button press depress | `--t-instant`  | linear          | translateY(1px)                    |
| Button press sweep   | `--t-blaze`    | `--ease-snappy` | ::after translateX(-100% → 100%)   |
| Badge hover scale    | `--t-fast`     | `--ease-snappy` | scale(1.05)                        |
| Switch card hover    | `--t-fast`     | `--ease-snappy` | translateX(2px)                    |
| Chevron slide        | `--t-fast`     | `--ease-snappy` | translateX(3px)                    |
| Cursor blink         | 530ms          | step-end        | opacity 1 → 0 → 1                  |

**State Transitions — reactive to game logic (200–500ms)**

| Animation           | Duration Token | Easing          | Trigger                               |
| ------------------- | -------------- | --------------- | ------------------------------------- |
| HP bar fill shrink  | `--t-slow`     | `--ease-snappy` | `width` CSS transition on data change |
| HP color shift      | `--t-medium`   | ease            | HP crosses threshold (50%, 20%)       |
| HP ghost bar decay  | `--t-hp-ghost` | ease-out        | Fires 800ms after fill shrinks        |
| Turn indicator swap | `--t-normal`   | `--ease-snappy` | `isMyTurn` flips                      |
| Switch card HP fill | `--t-normal`   | ease            | Team roster update                    |
| Panel accent glow   | `--t-medium`   | ease            | Whose turn it is                      |

**Dramatic — one-shot, narrative weight (500ms–1s)**

| Animation            | Duration Token     | Easing          | Trigger                                                      |
| -------------------- | ------------------ | --------------- | ------------------------------------------------------------ |
| Strike attack effect | `--t-strike`       | `--ease-attack` | Attack confirmed, attacker = any strike type                 |
| Bolt attack effect   | `--t-strike`       | `--ease-attack` | Attack confirmed, attacker = electric                        |
| Blaze attack effect  | `--t-blaze`        | `--ease-attack` | Attack confirmed, attacker = fire/dragon                     |
| Aqua attack effect   | `--t-blaze`        | `--ease-attack` | Attack confirmed, attacker = water/ice                       |
| Mystic attack effect | `--t-mystic`       | `--ease-attack` | Attack confirmed, attacker = psychic/fairy/ghost/dark/poison |
| Sprite damage shake  | `--t-sprite-hit`   | `--ease-bounce` | Defender receives damage                                     |
| Sprite KO faint      | `--t-sprite-ko`    | `--ease-ko`     | HP reaches zero                                              |
| Sprite entry         | `--t-sprite-entry` | `--ease-bounce` | Pokemon enters field                                         |
| Message typewriter   | 28ms/char          | —               | New message arrives                                          |

**Ambient — idle loops, always running**

| Animation            | Duration Token       | Direction            | What Loops                      |
| -------------------- | -------------------- | -------------------- | ------------------------------- |
| HP bar shimmer       | 2500ms               | linear infinite      | Background-position sweep       |
| Button idle scan     | `--t-btn-scan`       | linear infinite      | Scan-line drifts down           |
| Platform glow pulse  | `--t-platform-pulse` | ease-in-out infinite | scale(1) ↔ scale(1.08), opacity |
| Turn indicator pulse | `--t-turn-pulse`     | ease-in-out infinite | box-shadow intensity            |
| Dot blink            | 1000ms               | step-start infinite  | Opacity of status dot           |
| Switch title pulse   | 1500ms               | ease-in-out infinite | Opacity 1 ↔ 0.7                 |
| Advance bounce       | 800ms                | ease-in-out infinite | translateY(0) ↔ translateY(3px) |

---

## 4. Attack Effect System

### 4.1 Current Mapping (Redesigned)

The original "strike" bucket is the main problem — 8 types sharing one visual creates missed characterization opportunities. Below is the revised mapping with a new sixth style and better type routing.

| Style      | Types                                   | Visual Language                                                                | Duration             | Primary Color                       |
| ---------- | --------------------------------------- | ------------------------------------------------------------------------------ | -------------------- | ----------------------------------- |
| **blaze**  | fire, dragon                            | Expanding fire burst from contact point, orange-to-red bloom, heat distortion  | `--t-blaze` (700ms)  | `--type-fire` / `--type-dragon`     |
| **aqua**   | water, ice                              | Circular wave sweep, ripple rings expanding outward, cool blue flash           | `--t-blaze` (700ms)  | `--type-water` / `--type-ice`       |
| **bolt**   | electric                                | Full-screen flash + forked lightning bolt rendered as SVG path, charged static | `--t-strike` (550ms) | `--type-electric`                   |
| **mystic** | psychic, fairy, ghost, dark, poison     | Concentric ring pulse from target center, color matches attacker's type        | `--t-mystic` (750ms) | Attacker type token                 |
| **strike** | fighting, ground                        | Impact shockwave, dust particles, screen shake                                 | `--t-strike` (550ms) | `--type-fighting` / `--type-ground` |
| **slash**  | normal, rock, steel, bug, grass, flying | Diagonal slash lines crossing the target, 2–3 cuts, debris scatter             | `--t-strike` (550ms) | `--type-normal` / attacker type     |

Rationale for splitting "strike" into two:

- Fighting and Ground both deliver blunt kinetic force and share a shockwave+dust visual
- Normal, Rock, Steel, Bug, Grass, and Flying are physically varied but visually "clean contact" — slash lines communicate a non-elemental physical hit without requiring elemental particles
- This gives Rock a craggy slate-colored slash, Bug a quick two-cut slash, Grass a leaf-cut diagonal — all from the same slash animation with type-colored tinting

### 4.2 Type to Effect Mapping (TypeScript constant)

Create at `/src/lib/attackEffects.ts`:

```typescript
export type AttackStyle =
  | 'blaze'
  | 'aqua'
  | 'bolt'
  | 'mystic'
  | 'strike'
  | 'slash';

export const TYPE_TO_EFFECT: Record<string, AttackStyle> = {
  fire: 'blaze',
  dragon: 'blaze',
  water: 'aqua',
  ice: 'aqua',
  electric: 'bolt',
  psychic: 'mystic',
  fairy: 'mystic',
  ghost: 'mystic',
  dark: 'mystic',
  poison: 'mystic',
  fighting: 'strike',
  ground: 'strike',
  normal: 'slash',
  rock: 'slash',
  steel: 'slash',
  bug: 'slash',
  grass: 'slash',
  flying: 'slash',
} as const;

export function getAttackStyle(types: string[]): AttackStyle {
  // Use the first type of the attacker's type array
  const primary = types[0]?.toLowerCase() ?? 'normal';
  return TYPE_TO_EFFECT[primary] ?? 'slash';
}
```

### 4.3 Should All Effects Share the Same Duration?

No. Duration carries semantic meaning:

- **550ms (strike/bolt/slash):** Fast, decisive, kinetic. These are direct physical or electric hits. The speed communicates power delivery.
- **700ms (blaze/aqua):** Elemental energy builds slightly before resolving. A fireball has travel and bloom.
- **750ms (mystic):** Psychic and spectral effects expand from within. The extra time sells the "reaching outward" quality.

All three durations are still fast enough for game flow. At 750ms total, with the choreography delay stack (see Section 5), the entire attack sequence from click to HP bar update completes in approximately 2.2 seconds — appropriate for a turn-based game.

---

## 5. Sprite Animation States

### 5.1 Current States (Only 4)

The BattleScreen.tsx has no sprite animation states — it renders a plain `<img>` tag. The design system CSS references an `entering` state only via the platform pulse animation. All states need to be built.

### 5.2 Recommended States (8)

| State       | When                          | Duration                        | Animation                                                                                         |
| ----------- | ----------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `idle`      | Default battle state, my turn | Continuous                      | Gentle float: translateY(0) ↔ translateY(-4px), 2.5s ease-in-out infinite                         |
| `waiting`   | Opponent's turn               | Continuous                      | Slower float: translateY(0) ↔ translateY(-2px), 3.5s ease-in-out infinite, reduced opacity (0.85) |
| `entering`  | Pokemon sent to field         | `--t-sprite-entry`              | scale(0.6)→scale(1.05)→scale(1) with y-offset drop, ease-bounce                                   |
| `attacking` | This pokemon is attacking     | `--t-blaze` max                 | Brief forward lunge: translateX(12px for player, -12px for opponent) then snap back               |
| `damage`    | This pokemon received a hit   | `--t-sprite-hit`                | Shake: fast x-oscillation ±6px, 3 cycles                                                          |
| `critical`  | Received a critical hit       | `--t-sprite-hit` + screen flash | Same shake but amplitude ±10px, white flash overlay                                               |
| `fainting`  | HP reached 0                  | `--t-sprite-ko`                 | translateY(24px) + opacity(0) + slight rotate(8deg), ease-ko                                      |
| `reviving`  | (Future) Revive item          | `--t-sprite-entry`              | Same as entering but with white flash                                                             |

**State priority (highest wins):**
`fainting` > `critical` > `damage` > `attacking` > `entering` > `idle` / `waiting`

The `idle` vs `waiting` distinction is important — it communicates whose turn it is through the sprites themselves, not just the turn indicator. The active player's pokemon floats more energetically.

### 5.3 Framer Motion Variants Structure

```typescript
// Sprite animation variants for Framer Motion
// Duration values reference DURATION tokens from /src/lib/tokens.ts

const spriteVariants = {
  idle: {
    y: [0, -4, 0],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
  waiting: {
    y: [0, -2, 0],
    opacity: 0.85,
    transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
  },
  entering: {
    scale: [0.6, 1.05, 1],
    y: [-20, 0],
    transition: { duration: DURATION.spriteEntry, ease: EASE.bounce },
  },
  attacking: {
    // x direction depends on side — pass via custom prop or variant key
    x: [0, 12, 0],
    transition: { duration: DURATION.blaze, ease: EASE.snappy },
  },
  damage: {
    x: [0, -6, 6, -6, 6, -3, 3, 0],
    transition: { duration: DURATION.spriteHit, ease: 'linear' },
  },
  critical: {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    transition: { duration: DURATION.spriteHit, ease: 'linear' },
  },
  fainting: {
    y: 24,
    opacity: 0,
    rotate: 8,
    transition: { duration: DURATION.spriteKo, ease: EASE.ko },
  },
};
```

---

## 6. Interaction Choreography

### 6.1 Complete Attack Turn Sequence

This defines the exact timing of every animated event from click to turn-end. All times are cumulative from T=0 (player clicks FIGHT).

```
T=0ms        Player clicks FIGHT button
             → Button press: translateY(+1px), duration: --t-instant (60ms)
             → Button sweep fires: ::after translateX left→right, duration: --t-blaze (700ms)
             → Button scan animation stops
             → Emit ATTACK socket event
             → Buttons disabled immediately

T=60ms       Button releases back to hover state
             → translateY(-2px), duration: --t-micro (120ms)

T=200ms      Message box updates: "[Attacker] used [Move]!"
             → Typewriter starts: 28ms/char
             → Assume ~20 chars: completes at ~T=760ms

T=300ms      Attack effect fires on defender sprite
             → AttackEffect component mounts with correct style
             → Effect duration: 550–750ms depending on type

T=300ms      Attacker sprite enters 'attacking' state
             → Brief forward lunge toward opponent
             → Duration: --t-blaze (700ms) — matches longest effect
             → Snaps back at T=1000ms

T=850–1050ms Attack effect resolves (varies by type)
             → Strike/bolt/slash: resolves at T=850ms
             → Blaze/aqua: resolves at T=1000ms
             → Mystic: resolves at T=1050ms

T=900ms      Defender sprite enters 'damage' or 'critical' state
             → Shake duration: --t-sprite-hit (500ms)
             → Resolves at T=1400ms

T=950ms      HP bar width begins animating
             → fill transition: --t-slow (500ms), --ease-snappy
             → Resolves at T=1450ms

T=1750ms     Ghost bar begins fading
             → Delay 800ms after HP fill starts: 950 + 800 = T=1750ms
             → Ghost fade duration: --t-hp-ghost (1000ms)
             → Resolves at T=2750ms

T=1500ms     Effectiveness message appears in message box
             → "It's super effective!" in --battle-msg--super
             → OR "It's not very effective..." in --battle-msg--resisted
             → Typewriter: ~25 chars → resolves at ~T=2200ms

T=2200ms     [BRANCH: No KO]
             → Message "Turn X complete."
             → Auto-advance after --t-msg-advance (1400ms) → T=3600ms
             → Turn passes to opponent
             → Defender sprite returns to 'idle' or 'waiting'
             → Buttons re-enable if it's player's turn

T=2200ms     [BRANCH: KO]
             → Defender sprite enters 'fainting' state
             → Duration: --t-sprite-ko (900ms)
             → Resolves at T=3100ms

T=3100ms     KO message: "[Pokemon] fainted!" in --battle-msg--ko
             → Auto-advance after 1400ms → T=4500ms

T=4500ms     [BRANCH: KO, more pokemon remain]
             → Force-switch modal slides in if it's the player's pokemon
             → OR opponent's next pokemon enters 'entering' state

T=4500ms     [BRANCH: KO, last pokemon]
             → Victory/defeat message
             → View transitions to ResultScreen
```

**Total turn duration:**

- Normal hit (no KO): ~3.6 seconds from click to opponent's turn
- KO hit (switch available): ~5 seconds from click to switch modal
- KO hit (battle over): ~4.5 seconds from click to result screen

These timings feel right for turn-based RPG pacing. The longest sequence (5 seconds) includes meaningful narrative beats at each step.

### 6.2 Timing Sequence Diagram

```
Click  0    200   400   600   800  1000  1200  1400  1600  1800  2000  2200  2400
|      |     |     |     |     |     |    |     |     |     |     |     |     |
BTN    [==press==][==============sweep==============]
MSG1         [==========typewriter===========]
FX           [====strike/bolt/slash====]
FX                [======blaze/aqua======]
FX                      [========mystic=========]
ATKS         [=========attacker lunge===========]
DMGS                                   [====shake====]
HP                               [=====fill=====]
MSG2                                                   [====typewriter====]
GHOST                                         [===================ghost fade====================]
```

### 6.3 Pokemon Entry Sequence (Switch or Battle Start)

```
T=0ms    Pokeball appears at sprite position (scale 0 → 1, 200ms, ease-bounce)
T=200ms  Pokeball opens flash (white overlay, 80ms fade)
T=280ms  Sprite appears at scale(0.6), y(-20px)
T=280ms  Pokeball fades out (200ms)
T=280ms  Sprite animates to scale(1), y(0) over --t-sprite-entry (500ms)
T=780ms  Platform glow pulses once brighter (200ms), then settles into ambient loop
T=900ms  Sprite settles into 'idle' or 'waiting' loop
T=900ms  Message: "Go, [Pokemon]!" finishes typewriting
```

---

## 7. Component Specification

### 7.1 Build Order (Dependency Sequence)

The BattleScreen.tsx is currently the only presentation component and it uses no design system CSS. Build in this order to avoid rework:

1. **`/src/lib/tokens.ts`** — Animation tokens (no dependencies, pure data)
2. **`/src/lib/attackEffects.ts`** — Type-to-effect mapping (no dependencies)
3. **`/src/lib/hpColor.ts`** — HP threshold → color token function
4. **`PokemonInfoPanel`** — Wraps `.info-panel`, reads from `PokemonStateDTO`
5. **`TypeBadge`** — Wraps `.type-badge`, sets `data-type` attribute
6. **`BattleHUD`** — Wraps `.battle-hud`, `.battle-msg-box`, `.battle-action-menu`
7. **`BattleArena`** — Full arena with platforms and sprite positioning
8. **`PokemonSprite`** — Framer Motion sprite with 8 animation states
9. **`AttackEffect`** — Framer Motion overlay effects, 6 styles
10. **`BattleScreen` (redesign)** — Composes all of the above

### 7.2 PokemonInfoPanel Props

```typescript
interface PokemonInfoPanelProps {
  pokemon: PokemonStateDTO;
  side: 'player' | 'opponent';
  previousHp?: number; // for ghost bar — the HP before current update
}
```

The component sets `--hp-color` and `--platform-glow` as inline CSS custom properties on the relevant elements. It reads from `getTypeColor(pokemon.type[0])` for platform color.

### 7.3 AttackEffect Props

```typescript
interface AttackEffectProps {
  style: AttackStyle; // 'blaze' | 'aqua' | 'bolt' | 'mystic' | 'strike' | 'slash'
  typeColor: string; // from getTypeColor() — drives particle/ring tinting
  onComplete: () => void; // fires when animation finishes, triggers damage shake
  isCritical: boolean; // adds screen flash layer for critical hits
}
```

### 7.4 PokemonSprite Props

```typescript
interface PokemonSpriteProps {
  pokemon: PokemonStateDTO;
  side: 'player' | 'opponent';
  animationState:
    | 'idle'
    | 'waiting'
    | 'entering'
    | 'attacking'
    | 'damage'
    | 'critical'
    | 'fainting';
  platformGlowColor: string; // CSS color string for platform glow
}
```

### 7.5 BattleHUD Props

```typescript
interface BattleHUDProps {
  message: string;
  messageType?:
    | 'normal'
    | 'super'
    | 'resisted'
    | 'critical'
    | 'ko'
    | 'victory'
    | 'defeat';
  isTyping: boolean; // controls cursor blink
  isAwaitingInput: boolean; // shows advance indicator
  isMyTurn: boolean;
  mode: 'action' | 'switch'; // toggles between action menu and switch panel
  onAttack: () => void;
  onShowTeam: () => void;
  team?: PokemonStateDTO[]; // for switch mode
  activePokemonIndex?: number;
  onSwitch?: (index: number) => void;
}
```

---

## 8. Implementation Recommendations

### 8.1 The TYPE_COLORS Question

Do not create a TypeScript `TYPE_COLORS` constant. The CSS custom properties in `:root` are the correct single source of truth. Instead, use the `getTypeColor(type: string)` function from `/src/lib/tokens.ts`. This function calls `getComputedStyle` at runtime, which:

- Always reflects the CSS token value, even if you change the CSS
- Works with CSS `color-mix()` and any future theming
- Requires no synchronization between two files

For server-side rendering safety, the function returns `#a8a29e` (normal type) as a fallback when `window` is undefined. Since type colors only matter during active battle rendering (client-side), this is acceptable.

### 8.2 Framer Motion + CSS Token Synchronization

The bridge in `/src/lib/tokens.ts` is the right pattern. Key rules:

- CSS transitions handle HP bar, color shifts, and anything driven by data attribute or class changes — CSS is faster and simpler for these
- Framer Motion handles sprite animations and attack effects — anything that needs keyframe sequences, variant management, or orchestration via `AnimatePresence`
- Never mix: do not put sprite shake timings in CSS `@keyframes` when you have Framer Motion managing sprite state
- The `DURATION` object values are in seconds (Framer Motion's native unit). Multiply by 1000 if you ever need to pass to `setTimeout`

### 8.3 Resolving the CSS Architecture Issue

The `battle-design-system.css` currently lives at `/src/app/battle-design-system.css` and is imported via `@import './battle-design-system.css'` in `globals.css`. This is fine for now. When you add `/src/lib/tokens.ts`, you have the synchronization obligation. Document it with a comment at the top of `tokens.ts`:

```typescript
/**
 * Animation tokens for Framer Motion.
 * MUST match battle-design-system.css :root exactly.
 * When changing a value, update both files simultaneously.
 */
```

A Vitest test can enforce this automatically — read the CSS file, extract custom property values, compare against the DURATION/EASE objects. This prevents the drift problem from ever recurring.

### 8.4 The "Strike" Catch-All

The six-style mapping above is the fix. The slash style handles 6 types that previously shared strike. The key implementation detail: pass `typeColor` into the slash effect so each type gets a tinted version. Rock gets slate-gray slashes, Bug gets lime-green, Grass gets green, Flying gets light blue. Same animation, different color — maximum reuse, meaningful differentiation.

### 8.5 Missing Sprite States

Yes, add all 8 states. The `waiting` state (distinct from `idle`) is the highest-value addition because it gives the player visual feedback about whose turn it is through the sprites themselves, reinforcing the turn indicator without requiring the player to read text. The `attacking` state (brief lunge) closes the animation gap between button click and damage effect appearing — without it, the attacker sprite stands completely still while an effect plays on the opponent, which breaks cause-and-effect narrative.

### 8.6 The BattleScreen Rewrite Scope

The existing `BattleScreen.tsx` is functional and correct at the logic/data layer — all stores, hooks, and event handling work. The rewrite is purely presentation. Keep the existing component tree structure and logic, replace the JSX markup with the new component composition. Extract no new hooks; the existing `useBattle` hook already provides everything needed.

---

## 9. Accessibility Requirements

These are non-negotiable additions, not nice-to-haves:

**Reduced Motion:**

```css
@media (prefers-reduced-motion: reduce) {
  .info-panel__hp-fill {
    transition: width 150ms linear;
  }
  .info-panel__hp-fill::after {
    animation: none;
  }
  .platform__glow {
    animation: none;
  }
  .turn-indicator--mine {
    animation: none;
  }
  .battle-action-btn {
    animation: none;
  }
  .battle-msg-box__advance {
    animation: none;
  }
}
```

In Framer Motion, use `useReducedMotion()` hook and collapse variants to their final state when it returns true.

**Color Independence:**

HP state must not be communicated by color alone. The `.info-panel__hp-label` text ("HP") and `.info-panel__hp-value` fraction already carry the information. No change needed.

**Focus Indicators:**

```css
.battle-action-btn:focus-visible {
  outline: 2px solid var(--btn-neon);
  outline-offset: 3px;
}
.battle-switch-card:focus-visible {
  outline: 2px solid var(--neon-player);
  outline-offset: 2px;
}
```

**ARIA:**

- Turn indicator: `role="status"` `aria-live="polite"`
- Message box: `role="log"` `aria-live="polite"` `aria-atomic="false"`
- Attack button: `aria-disabled` when not player's turn (not just HTML `disabled` — screen readers should announce the reason)
- Pokemon sprites: `<img alt="[Pokemon name]">` already present in BattleScreen.tsx, keep it

---

## 10. File Map

After implementing this system, the relevant files will be:

```
src/
  app/
    battle-design-system.css   ← Updated with duration/easing tokens added to :root
    globals.css                ← No changes
  lib/
    tokens.ts                  ← NEW: EASE, DURATION, getTypeColor
    attackEffects.ts           ← NEW: TYPE_TO_EFFECT, getAttackStyle, AttackStyle type
    hpColor.ts                 ← NEW: getHpColor(hp, maxHp) → CSS token string
  presentation/
    components/
      BattleScreen.tsx         ← Full rewrite: composes new components
      PokemonInfoPanel.tsx     ← NEW: .info-panel + .info-panel__hp-track etc
      TypeBadge.tsx            ← NEW: .type-badge + data-type
      BattleHUD.tsx            ← NEW: .battle-hud + .battle-msg-box + .battle-action-menu
      BattleArena.tsx          ← NEW: .battle-arena layout + platform positioning
      PokemonSprite.tsx        ← NEW: Framer Motion sprite with 8 states
      AttackEffect.tsx         ← NEW: Framer Motion overlay, 6 styles
```

---

## Appendix A: CSS Token Additions to battle-design-system.css

Add the following to the existing `:root` block (after `--ease-snappy`):

```css
/* Attack easing curves */
--ease-attack: cubic-bezier(0.22, 1, 0.36, 1);
--ease-ko: cubic-bezier(0.55, 0, 1, 0.45);

/* Duration scale */
--t-instant: 60ms;
--t-micro: 120ms;
--t-fast: 150ms;
--t-normal: 300ms;
--t-medium: 400ms;
--t-slow: 500ms;
--t-strike: 550ms;
--t-blaze: 700ms;
--t-mystic: 750ms;
--t-sprite-snap: 150ms;
--t-sprite-hit: 500ms;
--t-sprite-entry: 500ms;
--t-sprite-ko: 900ms;
--t-hp-ghost: 1000ms;
--t-msg-advance: 1400ms;
--t-btn-scan: 3000ms;
--t-platform-pulse: 3000ms;
--t-turn-pulse: 2000ms;
```

Update existing transitions in the CSS to reference these tokens:

```css
/* Replace hardcoded values: */
.info-panel__hp-fill {
  transition:
    width var(--t-slow) var(--ease-snappy),
    background-color var(--t-medium),
    box-shadow var(--t-medium);
}
.info-panel__hp-ghost {
  transition: width var(--t-hp-ghost) ease-out;
}
.type-badge {
  transition:
    transform var(--t-fast),
    box-shadow var(--t-fast);
}
.battle-action-btn {
  transition:
    transform var(--t-micro) var(--ease-bounce),
    box-shadow var(--t-normal) ease,
    border-color var(--t-normal) ease;
}
.battle-action-btn:active:not(:disabled) {
  transition-duration: var(--t-instant);
}
.battle-action-btn:active:not(:disabled)::after {
  transition: transform var(--t-blaze) var(--ease-snappy);
}
.battle-action-btn::before {
  transition:
    transform var(--t-fast) var(--ease-snappy),
    opacity var(--t-fast) ease;
}
.battle-switch-card {
  transition: all var(--t-fast);
}
```

---

## Appendix B: Storybook Story Priorities

The project already has Storybook installed. These stories should be built before the BattleScreen rewrite to allow visual QA of components in isolation:

1. `PokemonInfoPanel.stories.tsx` — all HP states, player/opponent variants, type combinations
2. `TypeBadge.stories.tsx` — all 18 types, icon-only variant
3. `AttackEffect.stories.tsx` — all 6 styles with type color overrides, play controls for duration
4. `PokemonSprite.stories.tsx` — all 8 animation states, controls to trigger transitions
5. `BattleHUD.stories.tsx` — action mode vs switch mode, message type variants
6. `BattleScreen.stories.tsx` — full composition with mock socket data
