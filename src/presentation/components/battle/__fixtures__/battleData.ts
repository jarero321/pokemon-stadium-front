/**
 * Shared fixture data for battle stories and tests.
 * NOT for production code.
 */

import type { BattlePokemon } from '../types';

/* ── Teams ─────────────────────────────────────────── */

export const TEAMS: {
  player: BattlePokemon[];
  opponent: BattlePokemon[];
} = {
  player: [
    {
      name: 'charizard',
      types: ['fire', 'flying'],
      hp: 153,
      maxHp: 153,
      attack: 84,
      defense: 78,
      speed: 100,
    },
    {
      name: 'gengar',
      types: ['ghost', 'poison'],
      hp: 120,
      maxHp: 120,
      attack: 65,
      defense: 60,
      speed: 110,
    },
    {
      name: 'dragonite',
      types: ['dragon', 'flying'],
      hp: 182,
      maxHp: 182,
      attack: 134,
      defense: 95,
      speed: 80,
    },
  ],
  opponent: [
    {
      name: 'blastoise',
      types: ['water'],
      hp: 150,
      maxHp: 150,
      attack: 83,
      defense: 100,
      speed: 78,
    },
    {
      name: 'alakazam',
      types: ['psychic'],
      hp: 110,
      maxHp: 110,
      attack: 50,
      defense: 65,
      speed: 120,
    },
    {
      name: 'machamp',
      types: ['fighting'],
      hp: 180,
      maxHp: 180,
      attack: 130,
      defense: 80,
      speed: 55,
    },
  ],
};

/* ── Type effectiveness ────────────────────────────── */

export const TYPE_EFFECTIVENESS: Record<string, Record<string, number>> = {
  fire: {
    water: 0.5,
    grass: 1.5,
    ice: 1.5,
    bug: 1.5,
    steel: 1.5,
    fire: 0.5,
    rock: 0.5,
    dragon: 0.5,
  },
  water: {
    fire: 1.5,
    ground: 1.5,
    rock: 1.5,
    water: 0.5,
    grass: 0.5,
    dragon: 0.5,
  },
  ghost: { ghost: 1.5, psychic: 1.5, normal: 0, dark: 0.5 },
  dragon: { dragon: 1.5, steel: 0.5, fairy: 0 },
  fighting: {
    normal: 1.5,
    ice: 1.5,
    rock: 1.5,
    dark: 1.5,
    steel: 1.5,
    ghost: 0,
    flying: 0.5,
    psychic: 0.5,
    fairy: 0.5,
  },
  psychic: { fighting: 1.5, poison: 1.5, psychic: 0.5, dark: 0, steel: 0.5 },
};

/* ── Utility functions ─────────────────────────────── */

export function getMultiplier(atkTypes: string[], defTypes: string[]): number {
  let mult = 1;
  for (const at of atkTypes) {
    for (const dt of defTypes) {
      const eff = TYPE_EFFECTIVENESS[at]?.[dt];
      if (eff !== undefined) mult *= eff;
    }
  }
  return mult;
}

export function calcDamage(atk: number, def: number, mult: number): number {
  return Math.max(
    1,
    Math.round((atk - def * 0.6) * mult * (0.85 + Math.random() * 0.3)),
  );
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function findNextAlive(
  team: { hp: number }[],
  currentIdx: number,
  currentNewHp: number,
): number {
  for (let i = 0; i < team.length; i++) {
    if (i === currentIdx) {
      if (currentNewHp > 0) return i;
      continue;
    }
    if (team[i].hp > 0) return i;
  }
  return -1;
}
