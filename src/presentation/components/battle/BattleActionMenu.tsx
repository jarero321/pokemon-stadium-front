'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { SwitchCard } from './SwitchCard';

export interface ActionMenuPokemon {
  name: string;
  hp: number;
  maxHp: number;
  types: string[];
  defeated: boolean;
}

interface BattleActionMenuProps {
  disabled?: boolean;
  forcedSwitch?: boolean;
  onAttack?: () => void;
  onSwitch?: (pokemonIndex: number) => void;
  team?: ActionMenuPokemon[];
  activePokemonIndex?: number;
}

export function BattleActionMenu({
  disabled = false,
  forcedSwitch = false,
  onAttack,
  onSwitch,
  team = [],
  activePokemonIndex = 0,
}: BattleActionMenuProps) {
  const [showTeam, setShowTeam] = useState(false);
  const { t } = useTranslation();

  const handleSwitch = (index: number) => {
    onSwitch?.(index);
    setShowTeam(false);
  };

  /* ── Forced switch: full-width team selection ── */
  if (forcedSwitch) {
    return (
      <div className="p-2.5 px-3.5 flex flex-col justify-center gap-1.5 min-w-[195px]">
        <p className="text-[11px] font-black text-amber-400 uppercase tracking-[0.10em] text-center [text-shadow:0_0_8px_rgba(251,191,36,0.3)] animate-[switch-title-pulse_1.5s_ease-in-out_infinite]">
          {t('battle.chooseNext')}
        </p>
        <div className="flex flex-col gap-1">
          {team.map((p, i) => (
            <SwitchCard
              key={i}
              pokemon={p}
              isActive={i === activePokemonIndex}
              canSelect={!p.defeated && i !== activePokemonIndex}
              onClick={() => handleSwitch(i)}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── Voluntary team selection ── */
  if (showTeam) {
    return (
      <div className="p-2.5 px-3.5 flex flex-col justify-center gap-1.5 min-w-[195px]">
        <div className="flex flex-col gap-1">
          {team.map((p, i) => (
            <SwitchCard
              key={i}
              pokemon={p}
              isActive={i === activePokemonIndex}
              canSelect={!p.defeated && i !== activePokemonIndex && !disabled}
              onClick={() => handleSwitch(i)}
              badge={i === activePokemonIndex ? 'IN' : undefined}
            />
          ))}
        </div>
        <button
          onClick={() => setShowTeam(false)}
          className="py-1.5 px-2.5 rounded-md text-[11px] font-extrabold text-white/40 bg-white/[0.03] border border-white/[0.06] cursor-pointer transition-all duration-150 text-center uppercase tracking-wide mt-0.5 hover:bg-white/[0.06] hover:text-white/60 hover:border-white/[0.12]"
        >
          {t('battle.back')}
        </button>
      </div>
    );
  }

  /* ── Main menu: FIGHT / POKeMON ── */
  return (
    <div className="p-2.5 px-3 flex flex-col justify-center gap-2 min-w-[165px]">
      <button
        onClick={() => !disabled && onAttack?.()}
        disabled={disabled}
        className="battle-action-btn battle-action-btn--fight"
      >
        {t('battle.fight')}
      </button>
      <button
        onClick={() => !disabled && setShowTeam(true)}
        disabled={disabled}
        className="battle-action-btn battle-action-btn--pokemon"
      >
        {t('battle.pokemon')}
      </button>
    </div>
  );
}
