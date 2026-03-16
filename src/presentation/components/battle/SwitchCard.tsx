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
      role={readonly ? undefined : 'option'}
      aria-selected={isActive}
      aria-disabled={!canSelect}
      {...(!readonly && {
        onClick: () => canSelect && onClick?.(),
        disabled: !canSelect,
      })}
      className={`flex flex-col gap-0.5 p-2 px-2.5 rounded-lg bg-[#111827] border-2 border-[#334770] transition-all duration-150 text-left
        ${readonly ? 'cursor-default' : 'cursor-pointer hover:enabled:bg-violet-500/[0.08] hover:enabled:border-violet-400/50 hover:enabled:translate-x-0.5 disabled:opacity-25 disabled:cursor-not-allowed'}
        ${isActive ? 'border-violet-400 bg-violet-500/[0.06]' : ''}
        ${pokemon.defeated ? 'border-rose-500/20' : ''}`}
    >
      {children ?? (
        <>
          <span
            className={`text-xs font-extrabold capitalize tracking-wide flex items-center gap-1.5 ${pokemon.defeated ? 'text-slate-500' : 'text-slate-100'}`}
          >
            {pokemon.name}
            {badge && (
              <span className="text-[8px] font-black text-violet-400 bg-violet-500/15 px-1.5 py-px rounded-sm tracking-widest">
                {badge}
              </span>
            )}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-[#1e2940] rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm transition-[width] duration-300"
                style={{ width: `${hpPct}%`, background: hpColor }}
              />
            </div>
            <span
              className={`text-[10px] font-bold tabular-nums min-w-[42px] text-right ${pokemon.defeated ? 'text-rose-400/60' : 'text-slate-500'}`}
            >
              {pokemon.defeated ? 'FNT' : `${pokemon.hp}/${pokemon.maxHp}`}
            </span>
          </div>
        </>
      )}
    </Tag>
  );
}
