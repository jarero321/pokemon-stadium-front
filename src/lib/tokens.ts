/**
 * Design-system tokens — single source of truth for animation timing.
 *
 * Consumed by:
 *   - Framer Motion (numbers / cubic-bezier arrays)
 *   - CSS via @theme in globals.css (mirrored values)
 */

/* ── Easing curves ── */

export const EASE = {
  /** Overshoot bounce — pokeball pop, enter animations */
  bounce: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  /** Snappy deceleration — HP bars, general transitions */
  snappy: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  /** Fast attack wind-up — strike / slash effects */
  attack: [0.22, 0.68, 0.0, 1.0] as [number, number, number, number],
  /** Dramatic slow-out — fainting, KO sequences */
  ko: [0.4, 0.0, 0.2, 1.0] as [number, number, number, number],
} as const;

/* ── Duration scale (seconds, Framer Motion convention) ── */

export const DURATION = {
  /** 0.05s — instant feedback (opacity snaps, micro-flashes) */
  instant: 0.05,
  /** 0.1s — micro interactions (button press, chevron nudge) */
  micro: 0.1,
  /** 0.15s — fast UI (idle reset, tooltip) */
  fast: 0.15,
  /** 0.2s — normal transitions */
  normal: 0.2,
  /** 0.3s — switch-card hover, badge hover */
  slow: 0.3,
  /** 0.38s — button sweep */
  sweep: 0.38,
  /** 0.4s — blaze duration */
  blaze: 0.4,
  /** 0.5s — HP bar fill, damage shake, enter pop */
  hpFill: 0.5,
  /** 0.55s — strike / slash effect */
  strike: 0.55,
  /** 0.5s — sprite damage hit */
  spriteHit: 0.5,
  /** 0.65s — bolt flicker */
  bolt: 0.65,
  /** 0.7s — blaze burst, aqua wave */
  burst: 0.7,
  /** 0.75s — mystic rings */
  mystic: 0.75,
  /** 0.8s — ghost bar delay */
  hpGhost: 0.8,
  /** 0.9s — fainting fall */
  fainting: 0.9,
  /** 1.0s — ghost bar slide */
  ghostSlide: 1.0,
  /** 2.5s — HP shimmer loop */
  shimmer: 2.5,
  /** 3.0s — platform pulse / idle scan */
  platformPulse: 3.0,
} as const;

/* ── Runtime type-color reader ── */

const TYPE_FALLBACKS: Record<string, string> = {
  fire: '#f97316',
  water: '#3b82f6',
  grass: '#22c55e',
  electric: '#eab308',
  psychic: '#d946ef',
  ice: '#06b6d4',
  dragon: '#6366f1',
  dark: '#57534e',
  fairy: '#ec4899',
  fighting: '#ea580c',
  poison: '#a855f7',
  ground: '#b45309',
  rock: '#78716c',
  bug: '#65a30d',
  ghost: '#7c3aed',
  steel: '#64748b',
  normal: '#78716c',
  flying: '#60a5fa',
};

/**
 * Read a type color from CSS custom properties at runtime.
 * Falls back to a hardcoded value when SSR or `document` is unavailable.
 */
export function getTypeColor(type: string): string {
  const key = type.toLowerCase();
  if (typeof document !== 'undefined') {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`--color-type-${key}`)
      .trim();
    if (value) return value;
  }
  return TYPE_FALLBACKS[key] ?? TYPE_FALLBACKS.normal;
}

/**
 * HP color based on ratio (0–1).
 * Returns CSS custom property references from @theme tokens.
 */
export function getHpColor(ratio: number): string {
  if (ratio > 0.5) return 'var(--color-neon-safe)';
  if (ratio > 0.2) return 'var(--color-neon-warning)';
  return 'var(--color-neon-danger)';
}
