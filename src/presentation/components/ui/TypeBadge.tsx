/*
 * TypeBadge — renders a type pill with gradient fill, glow border, and icon.
 *
 * Usage:
 *   <TypeBadge type="fire" />
 *   <TypeBadge type="water" iconOnly />
 *   {pokemon.type.map(t => <TypeBadge key={t} type={t} />)}
 */

import React from 'react';

const TYPE_ICONS: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  grass: '🌿',
  electric: '⚡',
  psychic: '🔮',
  ice: '❄️',
  dragon: '🐉',
  dark: '🌑',
  fairy: '✨',
  fighting: '👊',
  poison: '☠️',
  ground: '🪨',
  rock: '⛰️',
  bug: '🐛',
  ghost: '👻',
  steel: '⚙️',
  normal: '⭐',
  flying: '🌪️',
};

interface TypeBadgeProps {
  type: string;
  iconOnly?: boolean;
  className?: string;
}

export function TypeBadge({
  type,
  iconOnly = false,
  className = '',
}: TypeBadgeProps) {
  const normalized = type.toLowerCase();
  const icon = TYPE_ICONS[normalized] ?? '?';

  /*
   * Colors are driven by CSS `data-type` attribute selectors
   * in battle-keyframes.css which set --type-color from --color-type-{name} tokens.
   * No inline color override needed.
   */

  return (
    <span
      className={`type-badge ${iconOnly ? 'type-badge--icon-only' : ''} ${className}`.trim()}
      data-type={normalized}
      aria-label={`Type: ${normalized}`}
    >
      <span className="type-badge__icon" aria-hidden="true">
        {icon}
      </span>
      {!iconOnly && normalized}
    </span>
  );
}
