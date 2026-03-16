'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ConnectionStatus } from '@/application/stores';
import type { PlayerDTO, PokemonStateDTO } from '@/domain/dtos';
import { useTranslation, useTips } from '@/lib/i18n';
import { TypeBadge, TurnIndicator } from './battle';
import { ConnectionDot } from './ui/ConnectionDot';
import { CountdownRing } from './ui/CountdownRing';
import { RotatingTips } from './ui/RotatingTips';

export interface ReadyScreenViewProps {
  status: ConnectionStatus;
  myPlayer: PlayerDTO | null;
  opponent: PlayerDTO | null;
  lobbyStatus: string | null;
  isReady: boolean;
  isBothReady: boolean;
  onReady: () => void;
  countdown: { remaining: number; progress: number } | null;
}

// Map the first type of a pokemon to a left-border accent color
function typeBorderClass(types: string[]): string {
  const type = types[0]?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    fire: 'border-l-[3px] border-l-orange-500/60',
    water: 'border-l-[3px] border-l-blue-400/60',
    grass: 'border-l-[3px] border-l-emerald-500/60',
    electric: 'border-l-[3px] border-l-yellow-400/60',
    psychic: 'border-l-[3px] border-l-pink-500/60',
    ice: 'border-l-[3px] border-l-cyan-300/60',
    dragon: 'border-l-[3px] border-l-indigo-500/60',
    dark: 'border-l-[3px] border-l-[#475569]/80',
    fairy: 'border-l-[3px] border-l-pink-300/60',
    fighting: 'border-l-[3px] border-l-red-600/60',
    poison: 'border-l-[3px] border-l-purple-500/60',
    ground: 'border-l-[3px] border-l-amber-700/60',
    rock: 'border-l-[3px] border-l-stone-500/60',
    ghost: 'border-l-[3px] border-l-violet-500/60',
    steel: 'border-l-[3px] border-l-slate-400/60',
    bug: 'border-l-[3px] border-l-lime-500/60',
    flying: 'border-l-[3px] border-l-sky-400/60',
    normal: 'border-l-[3px] border-l-[#475569]/50',
  };
  return map[type] ?? 'border-l-[3px] border-l-[#2a3a5c]';
}

function PokemonCard({ pokemon }: { pokemon: PokemonStateDTO }) {
  const [imgError, setImgError] = useState(false);
  const animatedSrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon.id}.gif`;
  const staticSrc = pokemon.sprite;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-[#1e2940] bg-[#0f1420] p-2.5 transition-colors hover:bg-[#161d2e] ${typeBorderClass(pokemon.type)}`}
    >
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center">
        <Image
          src={imgError ? staticSrc : animatedSrc}
          alt={pokemon.name}
          width={56}
          height={56}
          unoptimized
          className="pixelated object-contain"
          onError={() => setImgError(true)}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-extrabold capitalize text-[#e2e8f0]">
          {pokemon.name}
        </p>
        <div className="flex gap-1">
          {pokemon.type.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
          <span>
            ATK <span className="text-[#94a3b8]">{pokemon.attack}</span>
          </span>
          <span>
            DEF <span className="text-[#94a3b8]">{pokemon.defense}</span>
          </span>
          <span>
            SPD <span className="text-[#94a3b8]">{pokemon.speed}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function ReadyScreenView({
  status,
  myPlayer,
  opponent,
  isReady,
  isBothReady,
  onReady,
  countdown,
}: ReadyScreenViewProps) {
  const { t } = useTranslation();
  const tips = useTips();

  const subtitle =
    isReady || isBothReady
      ? t('ready.bothReady')
      : myPlayer?.ready
        ? t('ready.waitingOpponent')
        : t('ready.reviewTeam');

  return (
    <div className="flex h-[100dvh] flex-col bg-[#080c14]">
      {/* Connection warning */}
      {status !== 'connected' && (
        <div className="px-4 pt-3">
          <ConnectionDot status={status} />
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-6 pb-3 text-center">
        <h2 className="screen-heading mb-1.5">{t('ready.title')}</h2>
        <p className="screen-subtitle">{subtitle}</p>
      </div>

      {/* Scrollable teams area */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-6">
          {/* My team */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-violet-400">
                {myPlayer?.nickname ?? t('common.you')}
              </p>
              {myPlayer?.ready ? (
                <TurnIndicator isMyTurn={true}>
                  {t('common.ready')}
                </TurnIndicator>
              ) : (
                <span className="neon-badge neon-badge--neutral">
                  {t('common.notReady')}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {myPlayer?.team?.map((p) => (
                <PokemonCard key={p.id} pokemon={p} />
              ))}
            </div>
          </div>

          {/* VS divider */}
          <div className="flex items-center justify-center md:flex-col md:gap-2">
            <div className="h-px flex-1 bg-[#1e2940] md:h-full md:w-px md:flex-none" />
            <span className="mx-4 text-xl font-black uppercase tracking-widest text-violet-400 animate-pulse md:mx-0">
              VS
            </span>
            <div className="h-px flex-1 bg-[#1e2940] md:h-full md:w-px md:flex-none" />
          </div>

          {/* Opponent team */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-rose-400">
                {opponent?.nickname ?? t('common.opponent')}
              </p>
              {opponent?.ready ? (
                <TurnIndicator isMyTurn={true}>
                  {t('common.ready')}
                </TurnIndicator>
              ) : (
                <span className="neon-badge neon-badge--neutral">
                  {t('common.notReady')}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {opponent?.team?.map((p) => (
                <PokemonCard key={p.id} pokemon={p} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="border-t border-[#1e2940] bg-[#080c14]/95 backdrop-blur-md px-4 py-3 safe-bottom">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          {countdown && (
            <CountdownRing
              remaining={countdown.remaining}
              progress={countdown.progress}
              size={44}
            />
          )}
          <button
            onClick={onReady}
            disabled={myPlayer?.ready}
            className="battle-btn battle-btn--success flex-1"
          >
            {isBothReady
              ? t('ready.startingBattle')
              : myPlayer?.ready
                ? t('ready.waitingOpponent')
                : t('ready.imReady')}
          </button>
        </div>

        {/* Tips */}
        <div className="mx-auto mt-2 max-w-3xl">
          <RotatingTips tips={tips} />
        </div>
      </div>
    </div>
  );
}
