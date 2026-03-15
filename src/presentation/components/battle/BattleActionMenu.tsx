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
  if (forcedSwitch) {
    return (
      <div
        className="p-2.5 px-3.5 flex flex-col justify-center gap-1.5 min-w-[195px]"
        role="listbox"
        aria-label={t('battle.chooseNext')}
      >
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
  if (showTeam) {
    return (
      <div
        className="p-2.5 px-3.5 flex flex-col justify-center gap-1.5 min-w-[195px]"
        role="listbox"
        aria-label={t('battle.pokemon')}
      >
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
          className="py-1.5 px-2.5 rounded-md text-[11px] font-extrabold text-[#475569] bg-[#0f1420] border border-[#1e2940] cursor-pointer transition-all duration-150 text-center uppercase tracking-wide mt-0.5 hover:bg-[#161d2e] hover:text-[#94a3b8] hover:border-[#2a3a5c]"
        >
          {t('battle.back')}
        </button>
      </div>
    );
  }
  return (
    <div
      className="p-2.5 px-3 flex flex-col justify-center gap-2 min-w-[165px]"
      role="toolbar"
      aria-label={t('battle.actions')}
    >
      <button
        onClick={() => !disabled && onAttack?.()}
        disabled={disabled}
        aria-label={t('battle.fight')}
        className="battle-action-btn battle-action-btn--fight"
      >
        {t('battle.fight')}
      </button>
      <button
        onClick={() => !disabled && setShowTeam(true)}
        disabled={disabled}
        aria-label={t('battle.pokemon')}
        className="battle-action-btn battle-action-btn--pokemon"
      >
        {t('battle.pokemon')}
      </button>
    </div>
  );
}
