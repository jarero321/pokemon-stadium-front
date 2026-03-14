'use client';

import React from 'react';
import { getHpColor } from '@/lib/tokens';

export interface SwitchCardPokemon {
  name: string;
  hp: number;
  maxHp: number;
  types?: string[];
  defeated: boolean;
}

interface SwitchCardProps {
  pokemon: SwitchCardPokemon;
  isActive?: boolean;
  canSelect?: boolean;
  onClick?: () => void;
  badge?: string;
  readonly?: boolean;
  children?: React.ReactNode;
}

export function SwitchCard({
  pokemon,
  isActive = false,
  canSelect = true,
  onClick,
  badge,
  readonly = false,
  children,
}: SwitchCardProps) {
  const ratio = pokemon.maxHp > 0 ? pokemon.hp / pokemon.maxHp : 0;
  const hpPct = ratio * 100;
  const hpColor = getHpColor(ratio);

  const Tag = readonly ? 'li' : 'button';

  return (
    <Tag
      {...(!readonly && {
        onClick: () => canSelect && onClick?.(),
        disabled: !canSelect,
      })}
      className={`flex flex-col gap-0.5 p-2 px-2.5 rounded-lg bg-white/[0.04] border-2 border-white/[0.08] transition-all duration-150 text-left
        ${readonly ? 'cursor-default' : 'cursor-pointer hover:enabled:bg-green-400/[0.08] hover:enabled:border-green-400/30 hover:enabled:translate-x-0.5 disabled:opacity-25 disabled:cursor-not-allowed'}
        ${isActive ? 'border-sky-400/30 bg-sky-400/[0.06]' : ''}
        ${pokemon.defeated ? 'border-red-400/15' : ''}`}
    >
      {children ?? (
        <>
          <span className="text-xs font-extrabold text-slate-100 capitalize tracking-wide flex items-center gap-1.5">
            {pokemon.name}
            {badge && (
              <span className="text-[8px] font-black text-neon-player bg-sky-400/15 px-1.5 py-px rounded-sm tracking-widest">
                {badge}
              </span>
            )}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-white/[0.08] rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm transition-[width] duration-300"
                style={{ width: `${hpPct}%`, background: hpColor }}
              />
            </div>
            <span className="text-[10px] font-bold text-white/40 tabular-nums min-w-[42px] text-right">
              {pokemon.defeated ? 'FNT' : `${pokemon.hp}/${pokemon.maxHp}`}
            </span>
          </div>
        </>
      )}
    </Tag>
  );
}
