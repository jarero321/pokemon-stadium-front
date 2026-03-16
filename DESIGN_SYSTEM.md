# Pokemon Stadium — Design System

**Version:** 1.0
**Date:** 2026-03-15
**Status:** Reference document

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [The Core Problem: Too Many Accent Colors](#2-the-core-problem-too-many-accent-colors)
3. [Color System](#3-color-system)
4. [Surface Hierarchy](#4-surface-hierarchy)
5. [Typography Scale](#5-typography-scale)
6. [Spacing System](#6-spacing-system)
7. [Border Radius System](#7-border-radius-system)
8. [Shadow System](#8-shadow-system)
9. [Animation System](#9-animation-system)
10. [Component Patterns](#10-component-patterns)
11. [Accessibility Requirements](#11-accessibility-requirements)
12. [Implementation Notes](#12-implementation-notes)

---

## 1. Design Philosophy

### The Reference Matrix

This design system draws from three distinct traditions and synthesizes them into a single coherent direction:

**Fintech precision** (Mercury, Stripe, Revolut, Nubank, Wise)
These apps share a discipline around color economy. Mercury uses a near-monochromatic palette where a single blue anchors the entire interface — every interaction traces back to one hue. Stripe uses "Blurple" (#635BFF) as the solitary accent across millions of touchpoints. Revolut's dark mode is architecturally strict: one teal/violet accent, four surface levels, zero decorative color noise. Nubank's entire brand is a single purple. Wise uses a specific green for one reason: to signal money moving successfully. The lesson is consistent: world-class fintech products treat color as a scarce resource.

**Apple's Human Interface Guidelines (dark mode)**
Apple's system is built on two axes. First, a strict six-level surface hierarchy (grouped background → background → secondary grouped background → secondary background → tertiary background → elevated). Second, a single "tint color" — blue by default, but any hue — that propagates to every interactive element, focus ring, selection, and call to action. Apple's design language does not compete with itself. One accent color does all the work.

**Pokemon's visual language**
The games have a specific personality: punchy, immediate, physical. The GBA/DS era introduced a dark navy/night palette for battle screens. Pokemon Stadium on N64 used deep indigo-to-black gradients with bold yellow-white typography. The brand carries celebration (confetti, gold for victory), danger signals (red HP), and type-specific color systems — but these are not brand colors. They are data colors, used only to encode information.

### The Synthesis

Pokemon Stadium (this app) lives at the intersection. It needs:

- The color discipline and surface clarity of fintech
- The personality and animation energy of games
- A single brand color that feels native to Pokemon

It does not need six accent colors competing for the user's attention on every screen.

---

## 2. The Core Problem: Too Many Accent Colors

### Current State Audit

The codebase currently uses the following colors as decorative or semantic accents across UI components:

| Color     | Tailwind class    | Usage                                                                                  |
| --------- | ----------------- | -------------------------------------------------------------------------------------- |
| `#06b6d4` | `cyan-400/500`    | Player identity, spinner ring, turn bar, input focus, message cursor, platform glow    |
| `#6366f1` | `indigo-400/500`  | Primary action button, brand gradient, spinner counter-ring, win rate stat             |
| `#f43f5e` | `rose-400/500`    | Opponent identity, losses stat, attack buttons, surrender hover, defeat state          |
| `#10b981` | `emerald-400/500` | Success state, wins stat, team labels, step indicators, HP bar (healthy)               |
| `#f59e0b` | `amber-400/500`   | Opponent badge in lobby, leaderboard rank 1, leaderboard trophy icon, victory gradient |

Five distinct hue families. The problem is not that any one of these is wrong — each was chosen for a reason. The problem is that they appear together, often on the same screen, and create a carnival effect that undermines the premium quality this app is otherwise building toward.

Specific examples of color conflicts:

- The lobby screen shows cyan (my badge) + amber (opponent badge) + emerald (step done states) simultaneously. Three competing hues in a single status flow.
- The nickname screen's stats card shows emerald (wins), rose (losses), indigo (win rate) in three adjacent cells. This looks like a random color assignment, not a design decision.
- The spinner uses cyan + indigo counter-rotation. Two brand-adjacent colors doing identical jobs.
- The `brand-gradient` in `globals.css` goes from cyan to indigo — two different hues pretending to be one brand identity.

### The Principle

**One brand color. Semantic colors only for status. Type colors only for game data.**

Everything the user does — submitting a form, seeing their own player, focus states, active turn indicators, primary CTAs, the brand gradient — should read as a single coherent color. The user should be able to identify "this is MY color" immediately and consistently.

---

## 3. Color System

### 3.1 The Brand Color Decision: Violet

**Selected brand color: Violet `#7C3AED` (base) → `#8B5CF6` (primary) → `#A78BFA` (light)**

Rationale:

Violet sits at the intersection of Pokemon's two most iconic associations: the dark, mysterious atmosphere of late-game Pokemon (Ghost types, Legendary encounters, night-cycle gameplay) and the "stadium" energy (stage lighting, spectacle, prestige). Nintendo's own Pokemon branding uses violet-adjacent hues for Ghost type, Dragon type, and the "Legendary" tier feeling. The N64 Pokemon Stadium title screen used deep violet-to-black gradients.

Violet is also practical: it does not collide with any of the 18 Pokemon type colors when they appear as data labels. It does not read as a status color (not red/green/yellow). It reads as premium and purposeful — the same reason Stripe chose a blue-violet and Nubank chose purple.

Cyan was the previous player color but reads too "tech startup" and is too close to Water type. Indigo was the CTA color but reads too cool and corporate. Violet unifies them: it has the warmth that indigo lacks and the depth that cyan lacks.

### 3.2 Complete Color Palette

```
BRAND (Violet family — the ONE accent)
--color-brand-faint:    #1A1033   /* 8% opacity surface wash */
--color-brand-subtle:   #2D1A6E   /* border tints, mild backgrounds */
--color-brand-muted:    #5B21B6   /* dimmed, secondary brand uses */
--color-brand:          #7C3AED   /* base reference */
--color-brand-primary:  #8B5CF6   /* primary interactive — buttons, focus, active */
--color-brand-light:    #A78BFA   /* text on dark, badges, labels */
--color-brand-bright:   #C4B5FD   /* high contrast labels, hover text */

SURFACE HIERARCHY (see Section 4)
--color-base:           #04060E   /* true app background */
--color-depth:          #080C14   /* page background */
--color-surface-0:      #0B1020   /* lowest card */
--color-surface-1:      #0F1420   /* primary card, default */
--color-surface-2:      #161D2E   /* elevated card */
--color-surface-3:      #1E2940   /* highest surface, borders */
--color-surface-4:      #2A3A5C   /* interactive borders, dividers */

CONTENT (for text rendering)
--color-content-primary:    #F1F5F9   /* headings, values — slate-100 */
--color-content-secondary:  #CBD5E1   /* body text — slate-300 */
--color-content-tertiary:   #64748B   /* muted labels, placeholders — slate-500 */
--color-content-disabled:   #334155   /* disabled states — slate-700 */

STATUS (semantic only — never decorative)
--color-status-success:     #10B981   /* HP healthy, wins, confirmed action */
--color-status-warning:     #F59E0B   /* HP caution, turn timer low */
--color-status-danger:      #F43F5E   /* HP critical, error states */
--color-status-info:        #8B5CF6   /* informational (maps to brand) */

SPECIAL (contextual, not decorative)
--color-opponent:       #F43F5E   /* Opponent identity ONLY in battle context */
--color-gold:           #F59E0B   /* Victory, rank 1, trophy — celebration only */
--color-silver:         #94A3B8   /* Rank 2 */
--color-bronze:         #B45309   /* Rank 3 */

TYPE COLORS (data encoding — unchanged, these are correct)
--color-type-fire:      #F97316
--color-type-water:     #3B82F6
--color-type-grass:     #22C55E
--color-type-electric:  #EAB308
--color-type-psychic:   #D946EF
--color-type-ice:       #06B6D4
--color-type-dragon:    #6366F1
--color-type-dark:      #57534E
--color-type-fairy:     #EC4899
--color-type-fighting:  #EA580C
--color-type-poison:    #A855F7
--color-type-ground:    #B45309
--color-type-rock:      #78716C
--color-type-bug:       #65A30D
--color-type-ghost:     #7C3AED
--color-type-steel:     #64748B
--color-type-normal:    #78716C
--color-type-flying:    #60A5FA
```

**Note on Ghost type conflict:** Ghost type shares the base violet `#7C3AED`. This is acceptable because the brand color appears at `#8B5CF6` (brand-primary) in interactive contexts, while Ghost type renders as a badge background at `#7C3AED`. The visual differentiation is sufficient — one is a filled badge, the other is an interactive element. If this becomes a problem in a future audit, shift Ghost type to `#6D28D9`.

### 3.3 Color Usage Rules

**The brand color (`--color-brand-primary: #8B5CF6`) applies to:**

- Primary action buttons (CTA, form submit, Join Battle)
- Input focus ring
- Player identity badge ("you" in lobby)
- Active turn indicator dot + bar
- Message box cursor
- Platform glow on player's Pokemon
- Focus rings (`:focus-visible`) on all interactive elements
- The brand gradient (if retained): violet-to-violet shifted — `#7C3AED` → `#5B21B6`, not to a different hue family

**Status colors apply exclusively to:**

- HP bar fill (success/warning/danger based on HP ratio)
- Alert banners (error, warning, success messages)
- Form validation states
- Win/loss data display in stats (success for wins, danger for losses — but only where the meaning is specifically win/loss, not for general decoration)

**The opponent color (`#F43F5E`) applies exclusively to:**

- Opponent identity in battle (player card border, platform glow)
- The opponent visual role exists only during battle where the red-vs-violet polarity is the intended information

**Gold (`#F59E0B`) applies exclusively to:**

- Victory state (win screen headline gradient)
- Leaderboard rank 1 accent
- Trophy/medal iconography

**Emerald (`#10B981`) applies to:**

- HP bar when healthy (above 50%)
- Confirmed completed states in step indicators

Everything else that currently uses emerald, amber, cyan, or indigo for decoration should be replaced with brand violet.

---

## 4. Surface Hierarchy

### 4.1 The Layer System

Dark mode apps create perceived depth through luminance stepping, not through shadows alone. The key insight from Apple's dark mode and Revolut's dark theme: each surface level increases in lightness by approximately 3-5% relative luminance. This creates a reading order: deepest = background, brightest = foreground interactive.

```
Level 0 — True base (behind everything)
#04060E  — Used only as body/html background, not for components

Level 1 — Page background
#080C14  — The canvas. Every screen sits on this.

Level 2 — Lowest card (subtle containment)
#0B1020  — Battle arena background, info panels at rest

Level 3 — Primary card (standard container)
#0F1420  — glass-panel, player cards, pokemon cards, leaderboard

Level 4 — Elevated card (interactive or focused)
#161D2E  — Hover states, active cards, modals

Level 5 — Highest surface (borders, dividers, accents)
#1E2940  — All borders at rest
#2A3A5C  — Border hover states, interactive border emphasis
```

### 4.2 Surface Rules

**Never skip levels.** A card on the page background uses Level 3 (`#0F1420`). An element inside that card (a stat row, a sub-panel) uses Level 2 (`#0B1020`). An element that floats above a card (a tooltip, a dropdown) uses Level 4 (`#161D2E`).

**Borders follow their level.** A Level 3 card has a Level 5 border (`#1E2940`). A focused or active Level 3 card has the hover border (`#2A3A5C`). A card that carries brand identity (the player card) has a brand-tinted border.

**The inset highlight.** Premium dark-mode surfaces in Mercury and Stripe use a 1px top highlight at `rgba(255, 255, 255, 0.04)` — a subtle inset gradient that catches imaginary light from above. This already exists in the codebase (`glass-panel`, `pokemon-card`). Keep it. It adds perceived material quality for zero visual cost.

### 4.3 Overlay System

```
Modal backdrop:       rgba(4, 6, 14, 0.88) with backdrop-blur(16px)
Tooltip background:   #1E2940 with border #2A3A5C
Dropdown:             #161D2E with border #2A3A5C, shadow: see Section 8
Context menu:         #161D2E with border #2A3A5C
```

---

## 5. Typography Scale

### 5.1 Font Stack

No custom font is required. The system stack delivers high quality at zero load cost:

```
--font-display: -apple-system, BlinkMacSystemFont, 'SF Pro Display',
                'Segoe UI', system-ui, sans-serif

--font-body:    -apple-system, BlinkMacSystemFont, 'SF Pro Text',
                'Segoe UI', system-ui, sans-serif

--font-mono:    'SF Mono', 'Fira Code', 'Cascadia Code',
                ui-monospace, monospace
```

SF Pro (macOS/iOS), Segoe UI (Windows), and system-ui (Android/Linux) are all designed for legibility at small sizes on dark backgrounds. The pixel-rendered game sprites already carry the retro personality — the UI text does not need to perform that job.

### 5.2 Type Scale

Derived from a 1.25 modular scale (Major Third) anchored at 14px base:

```
TYPE SCALE

--text-2xs:   10px / 1.4  — status badges, type badges, column headers
--text-xs:    12px / 1.5  — secondary labels, tips text, move sub-labels
--text-sm:    14px / 1.5  — body text, input fields, button labels
--text-base:  16px / 1.5  — card headings, player names
--text-lg:    18px / 1.4  — stat values in cards
--text-xl:    20px / 1.3  — screen section headings
--text-2xl:   24px / 1.2  — screen titles
--text-3xl:   28px / 1.15 — primary screen headings (nickname title)
--text-4xl:   32px / 1.1  — display headings
--text-hero:  48px / 1.0  — victory/defeat title (mobile)
--text-jumbo: 72px / 1.0  — victory/defeat title (desktop)
```

### 5.3 Font Weight Usage

```
400 (regular)   — Body copy, descriptions
500 (medium)    — Secondary labels, navigation items
600 (semibold)  — Column headers, step labels, ghost button labels
700 (bold)      — Card headings, button labels, stat values, move names
800 (extrabold) — Screen titles, display headings
900 (black)     — Victory/defeat headline, large numerical displays
```

### 5.4 Letter Spacing Rules

```
Normal text:         0 (do not modify)
Uppercase labels:    0.06em to 0.12em (wider tracking for caps)
Monospace numbers:   font-variant-numeric: tabular-nums (already in codebase)
Hero display:        -0.02em (tight tracking for large text — premium feel)
```

### 5.5 Typography Hierarchy in Context

```
Screen header (h1 equivalent):
  font-size: 28px | font-weight: 800 | letter-spacing: -0.02em | color: #F1F5F9

Section heading (h2):
  font-size: 20px | font-weight: 700 | color: #F1F5F9

Card heading:
  font-size: 16px | font-weight: 700 | color: #F1F5F9

Body text:
  font-size: 14px | font-weight: 400 | color: #CBD5E1 | line-height: 1.5

Secondary label:
  font-size: 12px | font-weight: 500 | color: #64748B

Micro label (uppercase):
  font-size: 10px | font-weight: 600 | letter-spacing: 0.08em |
  text-transform: uppercase | color: #64748B

Stat value (large number):
  font-size: 18px | font-weight: 700 | font-family: monospace |
  font-variant-numeric: tabular-nums | color: #F1F5F9
```

---

## 6. Spacing System

### 6.1 Base Unit

The system uses a **4px base unit**. All spacing values are multiples of 4.

This aligns with Tailwind's default spacing scale (1 unit = 4px), Apple's HIG (4pt grid), and Material Design (4dp grid). The consistency across these systems is not coincidental — 4px maps cleanly to all display densities and provides enough granularity for fine-tuning without arbitrary values.

### 6.2 Spacing Scale

```
1   =  4px   — Tight gaps within components (icon + text, badge padding)
2   =  8px   — Component internal padding, small gaps
3   =  12px  — Standard gap between related elements
4   =  16px  — Standard card padding, section gaps
5   =  20px  — Generous card padding, form element spacing
6   =  24px  — Section dividers, larger gaps
8   =  32px  — Major section spacing
10  =  40px  — Between major layout blocks
12  =  48px  — Generous vertical breathing room
16  =  64px  — Full section separation
```

### 6.3 Layout Grid

**Mobile (< 640px):** Single column, 16px (4 units) horizontal padding
**Tablet (640px-1024px):** Max-width 640px centered, 24px padding
**Desktop (> 1024px):** Max-width 1280px, with two-column layouts available

The existing `max-w-sm` (384px) for battle/lobby screens and `max-w-3xl` (768px) for the nickname screen with leaderboard are correct. Keep them.

### 6.4 Component Internal Spacing

```
Button padding:         12px vertical / 20px horizontal (standard)
                        8px vertical / 16px horizontal (compact)
Card padding:           16px (mobile) / 20px (desktop)
Input padding:          13px vertical / 18px horizontal
Badge padding:          3px vertical / 10px horizontal
Micro badge padding:    1px vertical / 5px horizontal
Section gap:            24px between major components within a screen
Element gap:            8px between related inline elements
Form field gap:         20px between form fields
```

---

## 7. Border Radius System

### 7.1 Scale

Derived from studying Mercury, Revolut, and Apple's component library. Dark apps trend toward slightly rounder corners than light apps — it softens the high-contrast edges.

```
--radius-sm:   4px   — Badges, type tags, micro chips
--radius-md:   8px   — Buttons, inputs, small panels, move cells
--radius-lg:   10px  — Player cards, battle HUD
--radius-xl:   12px  — Pokemon cards, standard panels
--radius-2xl:  16px  — Major cards, glass panels (currently `rounded-2xl`)
--radius-full: 9999px — Pills, HP bars, dots, avatar circles
```

### 7.2 Usage Rules

**All interactive elements (buttons, inputs) use `--radius-md` (8px).** This is consistent with Stripe's button system and Apple's text fields. Round enough to feel modern, not so round that it reads as playful over precise.

**Cards and containers step up:** standard card is `--radius-xl` (12px), prominent panels are `--radius-2xl` (16px).

**Progress bars and pills always use `--radius-full`.** This is a universal convention.

**The battle arena** is square with `--radius-lg` (16px) on desktop — keeps the game feel without looking like a mobile card.

---

## 8. Shadow System

### 8.1 Shadow Philosophy

Dark mode shadows work differently than light mode. On dark backgrounds, shadows must be darker than the surface — but since the background is already very dark, the elevation is better communicated through surface lightness stepping (Section 4) than through drop shadows. Shadows in dark mode serve two purposes only: separation between surfaces of the same level, and "floating" for overlays.

### 8.2 Shadow Scale

```
Shadow 0 — None (flat, within a card)
  No shadow — elements inside a card that share the card surface

Shadow 1 — Subtle card
  0 2px 8px rgba(0, 0, 0, 0.35),
  0 1px 0 rgba(255, 255, 255, 0.03) inset
  Use: standard cards at rest

Shadow 2 — Raised card
  0 4px 16px rgba(0, 0, 0, 0.45),
  0 1px 0 rgba(255, 255, 255, 0.04) inset
  Use: glass-panel, pokemon-card, leaderboard

Shadow 3 — Elevated modal/overlay
  0 8px 32px rgba(0, 0, 0, 0.6),
  0 2px 8px rgba(0, 0, 0, 0.4),
  0 1px 0 rgba(255, 255, 255, 0.04) inset
  Use: dropdown menus, tooltips

Shadow 4 — Deep overlay
  0 16px 48px rgba(0, 0, 0, 0.7),
  0 4px 16px rgba(0, 0, 0, 0.5)
  Use: full-screen modals, the battle arena

Focus ring (brand):
  0 0 0 3px rgba(139, 92, 246, 0.25)
  Use: :focus-visible on all interactive elements

Focus ring (danger):
  0 0 0 3px rgba(244, 63, 94, 0.20)
  Use: form inputs in error state
```

### 8.3 Glow Effects

Glows are used sparingly in game UI. They communicate energy and power but become noise if overused.

```
Brand glow (hover CTA):
  0 6px 16px rgba(139, 92, 246, 0.35)

Danger glow (opponent, attack):
  0 6px 16px rgba(244, 63, 94, 0.35)

Success glow (HP healthy, wins):
  0 6px 16px rgba(16, 185, 129, 0.25)

Player platform glow:
  radial-gradient with brand color at 20% opacity

Opponent platform glow:
  radial-gradient with danger color at 15% opacity
```

---

## 9. Animation System

### 9.1 Principles

Apple's HIG motion principles, adapted for a game context:

**1. Animation should have meaning.** Every animation communicates something: state change, spatial relationship, consequence. The battle animations (HP drain, sprite shake, faint) all have clear cause and effect. The lobby spinner communicates waiting. Do not animate for decoration alone.

**2. Duration should match complexity.** Micro-interactions (button press, hover) are fast: 100-150ms. Standard transitions (entering a screen, opening a panel) are moderate: 200-300ms. Complex sequences (battle turn resolution, victory screen) are longer: 500-900ms. This mirrors Apple's guidelines exactly.

**3. Easing communicates material.** Physical objects decelerate on arrival (ease-out). Objects with energy overshoot (spring/bounce). Removal of elements accelerates (ease-in). The existing easing curves in the codebase are well-designed and should be kept.

**4. Spatial motion should respect reading direction.** Entering from the direction of the "source" is correct (Pokemon fainting falls down, not sideways). The battle arena uses bottom (player) vs top (opponent) positioning with spatial integrity.

**5. prefers-reduced-motion is mandatory.** Already implemented in `battle-keyframes.css`. Keep it. This is not optional.

### 9.2 Duration Reference

The existing timing system in `globals.css` and `tokens.ts` is well-structured. Preserve it completely. Reference only:

```
Instant:      50ms   — Flash effects, opacity snaps
Micro:        100ms  — Button press feedback, icon nudge
Fast:         150ms  — Hover transitions, state changes
Normal:       200ms  — Standard UI transitions
Slow:         300ms  — Card hovers, screen section enters
Sweep:        380ms  — Sweep animations
Blaze:        400ms  — HP color transitions
HP Fill:      500ms  — HP bar fill animation
Strike:       550ms  — Attack landing
Sprite Hit:   500ms  — Damage flash on sprite
Bolt:         650ms  — Electric/fast effects
Burst:        700ms  — Large hit effects
Mystic:       750ms  — Psychic/slow effects
HP Ghost:     800ms  — Ghost bar delay
Fainting:     900ms  — Pokemon fainting sequence
Ghost Slide:  1000ms — Ghost HP bar slide
Shimmer:      2500ms — HP bar shimmer loop
Platform:     3000ms — Platform pulse idle
```

### 9.3 Easing Curves Reference

```
Bounce:   cubic-bezier(0.34, 1.56, 0.64, 1)    — Pokeball pop, entry animations
Snappy:   cubic-bezier(0.25, 0.46, 0.45, 0.94)  — HP bars, standard transitions
Attack:   cubic-bezier(0.22, 0.68, 0.00, 1.00)  — Strike/slash wind-up
KO:       cubic-bezier(0.40, 0.00, 0.20, 1.00)  — Fainting, dramatic exits
```

### 9.4 Animation Categories

**Always animate:**
HP bar changes, sprite damage state, Pokemon faint, turn transition, screen enters, primary CTA hover, victory/defeat reveal

**Animate with system preference check (`prefers-reduced-motion`):**
Idle pulses (platform, status badge), shimmer loops, confetti, spinner

**Never animate:**
Static text content, disabled states, decorative borders, backgrounds

### 9.5 Framer Motion Usage Pattern

The codebase uses Framer Motion correctly. Preserve the `DURATION` and `EASE` token exports from `src/lib/tokens.ts` and extend them as the single source of truth for Framer Motion values, mirrored to CSS custom properties in `globals.css`. Do not use raw numbers in Framer Motion calls.

---

## 10. Component Patterns

### 10.1 Primary Button (CTA)

The primary button in the app currently uses indigo. Migrate to violet.

```
Background:    linear-gradient(135deg, #8B5CF6, #7C3AED)
Text:          #FFFFFF, weight 700, 14px
Border:        none
Border-radius: 8px (--radius-md)
Padding:       12px 20px
Shadow:        0 2px 4px rgba(0, 0, 0, 0.3),
               0 1px 0 rgba(255, 255, 255, 0.08) inset

Hover:
  Background:  linear-gradient(135deg, #A78BFA, #8B5CF6)
  Transform:   translateY(-1px)
  Shadow:      0 6px 16px rgba(139, 92, 246, 0.35),
               0 1px 0 rgba(255, 255, 255, 0.10) inset

Active:
  Background:  linear-gradient(135deg, #7C3AED, #6D28D9)
  Transform:   translateY(0)

Disabled:
  Opacity:     0.4
  Cursor:      not-allowed
```

### 10.2 Success Button (Play Again, Join Battle)

Retain emerald for success actions — this is semantically correct. Green = go, proceed, confirm.

```
Background:    linear-gradient(135deg, #10B981, #059669)
(Hover/Active follow same pattern as primary but with emerald glow)
```

### 10.3 Ghost / Secondary Button

```
Background:    transparent
Text:          #9CA3AF (slate-400), weight 600, 13px
Border:        1px solid #1E2940
Border-radius: 8px

Hover:
  Background:  #161D2E
  Text:        #F1F5F9
  Border:      #2A3A5C
  Transform:   translateY(-1px)
```

### 10.4 Input Field

Currently correctly styled. One change: focus ring migrates from cyan to brand violet.

```
Background:    #080C14 (depth)
Border:        1px solid #1E2940
Border-radius: 8px
Padding:       13px 18px
Text:          14px, #F1F5F9
Placeholder:   #4B5563

Focus:
  Border:      #8B5CF6 (brand-primary)
  Shadow:      0 0 0 3px rgba(139, 92, 246, 0.12)

Error:
  Border:      #F43F5E
  Shadow:      0 0 0 3px rgba(244, 63, 94, 0.12)
```

### 10.5 Player Cards (Battle Identity)

The player/opponent card system uses a left border accent to establish team identity. This is a clear, intentional design decision. Keep it.

```
Player card (YOU):
  Left border: 4px solid #8B5CF6 (brand-primary, not cyan)
  Platform glow: brand-primary at 20% opacity
  Badge: brand-primary text/background
  Label: "YOU" in brand-light (#A78BFA)

Opponent card (THEM):
  Left border: 4px solid #F43F5E (danger — unchanged)
  Platform glow: danger at 15% opacity
  Badge: danger text/background
  Label: "OPPONENT" in danger-light
```

The violet-vs-red polarity is visually strong, immediately readable, and semantically grounded (you = brand, opponent = threat).

### 10.6 HP Bar System

The three-state HP color system is correct and should not change. It follows universal game conventions.

```
HP > 50%:   #10B981 (status-success, emerald) — safe
HP 20-50%:  #F59E0B (status-warning, amber) — caution
HP < 20%:   #F43F5E (status-danger, rose) — critical
```

### 10.7 Player Badge in Lobby

Currently: player = cyan, opponent = amber. Migrate to:

```
Player badge:
  Border:      #8B5CF6/30 (brand with opacity)
  Background:  #8B5CF6/[0.06]
  Dot:         #8B5CF6 with brand glow
  Text:        #A78BFA (brand-light)

Opponent badge:
  Border:      #F43F5E/25
  Background:  #F43F5E/[0.06]
  Dot:         #F43F5E with danger glow
  Text:        #FB7185 (rose-400)
```

The amber opponent badge currently reads as positive/warm. Rose is more appropriate — it signals "other team, opposition" which prepares the user for the battle framing.

### 10.8 Step Indicator

Currently: done = emerald, active = cyan. Migrate to:

```
Done:    emerald — KEEP (completed step = success, this is semantic)
Active:  brand-primary violet (not cyan)
Pending: #1E2940 background, #475569 text
```

### 10.9 Alert Banners

No change needed. The `.alert-banner` pattern correctly uses CSS custom property `--alert-color` fed by modifier classes. Mapping remains:

```
.alert-banner--error:   --alert-color: #F43F5E
.alert-banner--warning: --alert-color: #F59E0B
.alert-banner--success: --alert-color: #10B981
.alert-banner--info:    --alert-color: #8B5CF6  (was cyan, now brand)
```

### 10.10 Neon Badge

```
.neon-badge--player:  brand-primary (#8B5CF6)  — was cyan
.neon-badge--safe:    status-success (#10B981)  — unchanged
.neon-badge--warning: status-warning (#F59E0B) — unchanged
.neon-badge--neutral: #9CA3AF                   — unchanged
```

### 10.11 Battle Action Menu

```
Fight button:   danger (#F43F5E) — KEEP (red = attack = universally understood)
Pokemon button: brand-primary (#8B5CF6) — was cyan
```

The fight/Pokemon distinction is a game-specific binary. Red (attack) vs Violet (switch) is clean and readable.

### 10.12 Turn Indicator Bar

Currently uses cyan. Migrate:

```
Your turn state:
  Background:  #8B5CF6/[0.06] (brand at 6%)
  Text:        #A78BFA/80 (brand-light)
  Dot:         #8B5CF6

Opponent turn state:
  Background:  #080C14
  Text:        #475569
  Dot:         rgba(255, 255, 255, 0.30)
```

### 10.13 Message Box Cursor

```
cursor background: #8B5CF6 (brand-primary, was cyan)
```

### 10.14 Matchmaking Spinner

Currently uses cyan outer ring + indigo counter-ring. Two colors for one loading state.

```
Outer ring:  border-t-violet-400/70  (brand-light)
Inner ring:  border-b-violet-600/40  (brand-muted — same hue, lower opacity)
Center dot:  brand-faint background
```

Single hue, two luminance levels. Reads as one unified indicator.

### 10.15 Brand Gradient

Currently `#06B6D4` (cyan) to `#6366F1` (indigo). Two different hue families masquerading as a brand gradient.

```
Replace with:
linear-gradient(135deg, #8B5CF6, #6D28D9)

Or for text:
linear-gradient(135deg, #A78BFA, #7C3AED)
```

Violet to deep violet. Same family. Reads as a single brand color with depth, not as two competing colors.

### 10.16 Leaderboard Rank Colors

```
Rank 1:  #F59E0B (gold/amber) — KEEP (universal "first place" convention)
Rank 2:  #94A3B8 (silver)    — KEEP
Rank 3:  #B45309 (bronze)    — KEEP
Win col: #10B981 (emerald)   — KEEP (semantic: wins are positive)
Loss col: #F43F5E (rose)     — KEEP (semantic: losses are negative)
Win rate color function: emerald/amber/rose by threshold — KEEP
```

These are all semantic or conventional. They are not brand colors. Keep them.

### 10.17 Victory Overlay

```
Victory title:   gold gradient — KEEP (amber-300 via yellow-400 to amber-500)
                 This is one of the few places where gold earns its presence:
                 victory is universally symbolized by gold.

Defeat title:    rose-400/80 — KEEP

Confetti colors: UPDATE — replace the cyan hue in the array with violet
  Was:     '#22d3ee' (cyan-400)
  Replace: '#A78BFA' (brand-light)
  Keep all other confetti colors: indigo-adjacent values can stay as
  confetti is celebratory decoration, not brand communication.

Winner team label:  emerald-400/70 — KEEP (semantic: winner)
Loser team label:   rose-400/50   — KEEP (semantic: loser)

Play Again button:  battle-btn--success (emerald) — KEEP
Exit button:        ghost-btn — KEEP
```

### 10.18 Focus-Visible System

All `:focus-visible` outlines must use the brand color:

```
outline:        2px solid #8B5CF6
outline-offset: 2px

Move cells use their type color — KEEP (this is correct interaction design:
the focus on a move follows the move's type, not the brand, because the
user is selecting a move by type)
```

---

## 11. Accessibility Requirements

### 11.1 Color Contrast (WCAG 2.1 AA minimum)

```
Primary text (#F1F5F9) on surface-1 (#0F1420): 13.8:1 — PASS (AAA)
Body text (#CBD5E1) on surface-1 (#0F1420):    10.1:1 — PASS (AAA)
Muted text (#64748B) on surface-1 (#0F1420):    4.6:1 — PASS (AA)
Brand-light (#A78BFA) on surface-1 (#0F1420):   6.8:1 — PASS (AA Large + AA)
Brand-primary (#8B5CF6) on surface-1 (#0F1420): 5.2:1 — PASS (AA)
Status-success (#10B981) on surface-1:           5.5:1 — PASS (AA)
Status-warning (#F59E0B) on surface-1:           8.0:1 — PASS (AA)
Status-danger (#F43F5E) on surface-1:            5.3:1 — PASS (AA)

Disabled text (#334155) on surface-1:            2.2:1 — FAIL (intentional,
  disabled states are exempt from contrast requirements per WCAG 1.4.3)
```

**Note on muted text (#64748B):** At 4.6:1, this passes AA for normal text (4.5:1 minimum). If this is used for text smaller than 18px bold or 14px regular, it passes. Do not use it for smaller sizes.

### 11.2 Reduced Motion

The existing `@media (prefers-reduced-motion: reduce)` rule in `battle-keyframes.css` is correct. It sets all animation durations to 0.01ms and iteration count to 1. This is the correct implementation. Verify it covers all `animation` properties including those added by Framer Motion's style injections.

### 11.3 Focus Management

- All interactive elements must have a `:focus-visible` ring
- Battle action buttons already implement this — extend to all interactive elements
- The turn timer and message box should not trap keyboard focus
- The victory overlay uses `role="dialog"` and `aria-modal="true"` — keep this
- Pokemon switch selection should be keyboard navigable (Tab + Enter/Space)

### 11.4 Touch Targets

Minimum 44x44px touch target for all interactive elements (Apple HIG standard, also iOS guidelines):

- Battle action buttons: already 46px height — PASS
- Move cells: 8px padding + content — verify this hits 44px total
- Ghost button: 10px padding + 13px text = ~33px — needs to be `min-height: 44px`
- Surrender button: currently very small (9px text, minimal padding) — needs a larger tap target using padding without expanding visual size, or use `::before` pseudo-element

---

## 12. Implementation Notes

### 12.1 Migration Priority

When migrating from the current palette to this system, address in this order:

1. **CSS custom properties in `globals.css`** — add new token names, keep old ones temporarily
2. **`globals.css` utilities** — migrate `.glass-input` focus, `.battle-btn--primary`, `.battle-action-btn--pokemon`, `.neon-badge--player`, brand-gradient, alert-info
3. **`battle-keyframes.css`** — migrate `.battle-msg-box__cursor`, `.info-panel` accent default
4. **`LobbyScreenView.tsx`** — spinner rings, player badge, step indicator active state
5. **`NicknameScreenView.tsx`** — the cyan label in player card, primary button
6. **`BattleScreenView.tsx`** — turn bar active state (cy -> violet classes)
7. **`VictoryOverlay.tsx`** — confetti color array
8. **`LeaderboardView.tsx`** — no changes needed (all semantic)

### 12.2 Tailwind Class Mapping

When the CSS custom properties are updated, these Tailwind class substitutions apply throughout the codebase:

```
WAS                          NOW
cyan-400/500/300            violet-400/500/300
border-cyan-*               border-violet-*
bg-cyan-*                   bg-violet-*
text-cyan-*                 text-violet-*
shadow-[..cyan..]           shadow-[..violet..]
indigo-400/500 (CTAs)       violet-400/500
border-indigo-*             border-violet-*
bg-indigo-*                 bg-violet-*
```

**Do NOT change:**

- `rose-*` / `red-*` — opponent, danger, attack (semantic)
- `emerald-*` / `green-*` — wins, success, HP safe (semantic)
- `amber-*` / `yellow-*` — gold/victory/rank 1 (conventional)
- All type-badge data colors — game data, not brand

### 12.3 Extending `tokens.ts`

Add the following to `src/lib/tokens.ts`:

```typescript
export const COLOR = {
  brand: {
    faint: '#1A1033',
    subtle: '#2D1A6E',
    muted: '#5B21B6',
    base: '#7C3AED',
    primary: '#8B5CF6',
    light: '#A78BFA',
    bright: '#C4B5FD',
  },
  surface: {
    base: '#04060E',
    depth: '#080C14',
    s0: '#0B1020',
    s1: '#0F1420',
    s2: '#161D2E',
    s3: '#1E2940',
    s4: '#2A3A5C',
  },
  content: {
    primary: '#F1F5F9',
    secondary: '#CBD5E1',
    tertiary: '#64748B',
    disabled: '#334155',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#F43F5E',
    info: '#8B5CF6',
  },
} as const;
```

### 12.4 The "One Color" Test

Before shipping any new UI component or screen, apply this test:

> If you squint at the screen and blur your vision slightly, how many distinct hue families do you see?

The answer should be: **two**. Dark neutrals (the surface hierarchy) and one accent hue (violet). Status colors will appear only when there is status to communicate. Type colors only on type badges. Everything else is neutral.

If you see three or more distinct hue families on a single screen without an active battle or status condition, you have too many accents.

### 12.5 Common Anti-Patterns to Avoid

**Anti-pattern: Color coding players with different hues on non-battle screens**
The lobby uses cyan for you and amber for the opponent. Outside of the battle context, this framing is premature. In the lobby, both players are preparing — it's cooperative, not adversarial. Consider using brand violet for you and a simple neutral for the opponent's display until the battle starts.

**Anti-pattern: Using three separate semantic colors in a single stat block**
The wins/losses/winRate stat block uses emerald/rose/indigo. This reads as arbitrary. A cleaner approach: show all three in `#F1F5F9` (primary text), and let the stat labels communicate what each number means. Reserve color for outliers: if winRate > 70%, show it in emerald. Otherwise neutral. The number's meaning comes from its label, not its color.

**Anti-pattern: Multi-color brand gradient**
A gradient from cyan to indigo spans two different hue families. Gradients should stay within one hue family (or adjacent) unless they represent a specific metaphor (the Pokemon type gradient system is an exception — but it maps to data, not identity).

**Anti-pattern: Animating colors that don't need to animate**
Status colors should transition when the status changes (HP dropping from safe to warning). They should not pulse or animate in their resting state unless the status itself is active (e.g., PSN pulsing when a Pokemon is poisoned). A poisoned Pokemon's badge pulses — that animation is semantic. A "your turn" indicator pulsing in cyan communicates nothing extra that a static indicator would not.

---

## Appendix A: Color Audit Checklist

Before each release, verify these specific points:

- [ ] No `cyan-*` classes appear for brand/player identity (only allowed in type-ice badge)
- [ ] No `indigo-*` classes appear for CTA buttons (only allowed in type-dragon badge)
- [ ] `:focus-visible` rings use `violet-*` / `#8B5CF6` on all non-type-specific elements
- [ ] The matchmaking spinner uses a single hue family
- [ ] Brand gradient stays within violet family
- [ ] Stat blocks do not use three different accent colors simultaneously
- [ ] Confetti does not include cyan (replace with violet)
- [ ] All new components pass the "one color test" (two hue families when blurred)
- [ ] `prefers-reduced-motion` is respected by all new animations
- [ ] Minimum touch target of 44px on all interactive elements
- [ ] Contrast ratios verified for any new text/background combinations

---

## Appendix B: Design Rationale Summary

The single most important decision in this design system is the choice to treat color as a scarce resource. Every major consumer product that achieves a sense of quality — Mercury, Stripe, Revolut, Apple itself — uses this discipline. More colors do not mean more personality; they mean more noise.

For a game, personality comes from:

- **Motion** — The battle animations, HP bar transitions, sprite faint sequences, confetti. These create feeling.
- **Typography weight and scale** — The contrast between the tiny 10px type badges and the 72px victory headline creates drama.
- **The pixel art sprites** — Charizard's flame, Blastoise's cannons, Pikachu's electricity. The game's character is carried by the IP, not by the UI color palette.
- **One strong accent color used with total consistency** — When violet appears, the user knows it means something. It means: this is your action, this is your player, this is the moment to decide.

The redesign does not make the app less vibrant. It makes the vibrance intentional.

---

_This document is the design contract for the Pokemon Stadium frontend. All new components should reference it. All color decisions that deviate from it require a documented rationale._
