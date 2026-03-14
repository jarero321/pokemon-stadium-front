'use client';

import { useState, useEffect } from 'react';
import type { ConnectionStatus } from '@/application/stores';
import type { PlayerDTO, PokemonStateDTO } from '@/domain/dtos';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation, useTips } from '@/lib/i18n';
import { TypeBadge, TurnIndicator } from './battle';
import { ConnectionDot } from './ui/ConnectionDot';

export interface ReadyScreenViewProps {
  status: ConnectionStatus;
  myPlayer: PlayerDTO | null;
  opponent: PlayerDTO | null;
  lobbyStatus: string | null;
  isReady: boolean;
  isBothReady: boolean;
  onReady: () => void;
}

function PokemonCard({ pokemon }: { pokemon: PokemonStateDTO }) {
  const [imgError, setImgError] = useState(false);
  const animatedSrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon.id}.gif`;
  const staticSrc = pokemon.sprite;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF with onError fallback requires native img */}
      <img
        src={imgError ? staticSrc : animatedSrc}
        alt={pokemon.name}
        width={72}
        height={72}
        className="pixelated"
        onError={() => setImgError(true)}
      />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-extrabold capitalize tracking-wide text-slate-100">
          {pokemon.name}
        </p>
        <div className="flex gap-1">
          {pokemon.type.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
          <span>
            ATK <span className="text-white/70">{pokemon.attack}</span>
          </span>
          <span>
            DEF <span className="text-white/70">{pokemon.defense}</span>
          </span>
          <span>
            SPD <span className="text-white/70">{pokemon.speed}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function RotatingTips() {
  const tips = useTips();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [tips.length]);

  return (
    <div className="relative h-10 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          className="absolute inset-0 flex items-center justify-center text-center text-xs text-white/40"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          💡 {tips[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export function ReadyScreenView({
  status,
  myPlayer,
  opponent,
  lobbyStatus,
  isReady,
  isBothReady,
  onReady,
}: ReadyScreenViewProps) {
  const { t } = useTranslation();

  const subtitle =
    isReady || isBothReady
      ? t('ready.bothReady')
      : myPlayer?.ready
        ? t('ready.waitingOpponent')
        : t('ready.reviewTeam');

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-3xl glass-panel rounded-xl p-8">
        {/* Connection warning */}
        {status !== 'connected' && (
          <div className="mb-4">
            <ConnectionDot status={status} />
          </div>
        )}

        <h2 className="screen-heading mb-2 text-center">{t('ready.title')}</h2>
        <p className="mb-6 text-center text-sm text-white/40">{subtitle}</p>

        {/* Teams side by side with VS divider */}
        <div className="mb-6 grid grid-cols-[1fr_auto_1fr] gap-4">
          {/* My team */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-100">
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
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="h-full w-px bg-white/10" />
            <span className="text-2xl font-black uppercase tracking-widest text-white/20 animate-pulse">
              VS
            </span>
            <div className="h-full w-px bg-white/10" />
          </div>

          {/* Opponent team */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-100">
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

        {/* Status */}
        <div className="mb-4 text-center text-xs text-gray-500">
          {lobbyStatus ?? t('common.loading')}
        </div>

        {/* Ready button */}
        <button
          onClick={onReady}
          disabled={myPlayer?.ready}
          className="battle-btn battle-btn--attack"
        >
          {isBothReady
            ? t('ready.startingBattle')
            : myPlayer?.ready
              ? t('ready.waitingOpponent')
              : t('ready.imReady')}
        </button>

        {/* Rotating tips */}
        <div className="mt-4">
          <RotatingTips />
        </div>
      </div>
    </div>
  );
}
