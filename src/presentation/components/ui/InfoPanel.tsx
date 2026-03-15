/*
 * InfoPanel — glass morphism stat panel for active battle pokemon.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { TypeBadge } from './TypeBadge';
import { getHpColor, DURATION, EASE } from '@/lib/tokens';

interface PokemonData {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  type: string[];
  sprite?: string;
}

interface InfoPanelProps {
  pokemon: PokemonData | null;
  side: 'player' | 'opponent';
  nickname?: string;
  aliveCount?: number;
  teamSize?: number;
  className?: string;
}

const STAT_MAX = { attack: 180, defense: 180, speed: 180 };

function statPct(value: number, key: keyof typeof STAT_MAX): string {
  return `${Math.min(100, Math.round((value / STAT_MAX[key]) * 100))}%`;
}

export function InfoPanel({
  pokemon,
  side,
  nickname,
  aliveCount,
  teamSize,
  className = '',
}: InfoPanelProps) {
  const ratio = pokemon ? pokemon.hp / pokemon.maxHp : 1;
  const hpPct = Math.round(ratio * 100);
  const hpColor = getHpColor(ratio);

  const ghostWidth = useMotionValue(hpPct);
  const prevHp = useRef<number | null>(null);

  // Ghost bar: Framer Motion animate — useEffect only to track prev HP
  useEffect(() => {
    if (pokemon && prevHp.current !== null && pokemon.hp !== prevHp.current) {
      if (pokemon.hp < prevHp.current) {
        animate(ghostWidth, hpPct, {
          duration: DURATION.ghostSlide,
          ease: EASE.snappy,
          delay: DURATION.hpGhost,
        });
      } else {
        ghostWidth.jump(hpPct);
      }
    }
    if (pokemon) prevHp.current = pokemon.hp;
  }, [pokemon, hpPct, ghostWidth]);

  return (
    <div
      className={`info-panel info-panel--${side} w-56 rounded-[14px] py-2.5 px-3.5 pb-3 ${className}`.trim()}
      role="region"
      aria-label={`${side === 'player' ? 'Your' : "Opponent's"} Pokemon stats`}
    >
      {/* Header row */}
      <div className="flex items-baseline justify-between mb-1 pl-2">
        <span className="text-[13px] font-extrabold tracking-wide text-slate-100 [text-shadow:0_0_12px_rgba(255,255,255,0.20)] uppercase">
          {pokemon?.name ?? '—'}
        </span>
        {teamSize !== undefined && aliveCount !== undefined && (
          <span className="text-[10px] font-bold text-white/40 tracking-wider">
            {aliveCount}/{teamSize}
          </span>
        )}
      </div>

      {/* Nickname row */}
      {nickname && (
        <div className="pl-2 mb-1">
          <span className="text-[9px] text-white/35 font-semibold">
            {nickname}
          </span>
        </div>
      )}

      {/* Type badges */}
      {pokemon?.type && (
        <div className="flex gap-1 pl-2 mb-1.5">
          {pokemon.type.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
      )}

      {/* HP numbers */}
      <div className="flex justify-between items-center px-2">
        <span
          className="info-panel__hp-label"
          style={{ '--hp-color': hpColor } as React.CSSProperties}
        >
          HP
        </span>
        <span className="text-[10px] font-semibold text-white/55 tabular-nums">
          {pokemon ? `${pokemon.hp}/${pokemon.maxHp}` : '—'}
        </span>
      </div>

      {/* HP track */}
      <div className="hp-track mx-2 mt-1 mb-1">
        <motion.div
          className="absolute inset-0 right-auto rounded-full bg-white/18"
          style={{ width: `${ghostWidth.get()}%` }}
        />
        <div
          className="info-panel__hp-fill"
          style={
            {
              width: `${hpPct}%`,
              '--hp-color': hpColor,
            } as React.CSSProperties
          }
        />
      </div>

      {/* Mini stats */}
      {pokemon && (
        <div className="flex gap-2 mt-1.5 pt-1.5 border-t border-white/[0.06] mx-2">
          {(
            [
              { key: 'attack', label: 'ATK', value: pokemon.attack },
              { key: 'defense', label: 'DEF', value: pokemon.defense },
              { key: 'speed', label: 'SPD', value: pokemon.speed },
            ] as const
          ).map(({ key, label, value }) => (
            <div key={key} className="flex flex-col items-center gap-px flex-1">
              <span className="text-[8px] font-bold tracking-widest text-white/[0.28] uppercase">
                {label}
              </span>
              <span className="text-[11px] font-extrabold text-white/70 tabular-nums">
                {value}
              </span>
              <div
                className="info-panel__stat-bar"
                style={
                  { '--stat-pct': statPct(value, key) } as React.CSSProperties
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
