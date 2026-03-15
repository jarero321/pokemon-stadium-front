'use client';

import { useState, useEffect } from 'react';
import type { ConnectionStatus } from '@/application/stores';
import type { PlayerDTO } from '@/domain/dtos';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation, useTips } from '@/lib/i18n';
import { ConnectionDot } from './ui/ConnectionDot';

export interface LobbyScreenViewProps {
  status: ConnectionStatus;
  connectionError: string | null;
  nickname: string | null;
  lobbyStatus: string | null;
  myPlayer: PlayerDTO | null;
  opponent: PlayerDTO | null;
  waitingForOpponent: boolean;
  onLeave: () => void;
}

function MatchmakingSpinner() {
  return (
    <div className="relative mx-auto h-20 w-20">
      {/* Outer ring — cyan */}
      <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet-400/70" />
      {/* Inner ring — indigo, counter-rotating */}
      <div
        className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-violet-600/40"
        style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
      />
      {/* Center pokeball */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-[#2a3a5c] bg-[#0f1420]">
          <div className="h-1/2 rounded-t-full bg-rose-500/30" />
        </div>
      </div>
    </div>
  );
}

interface MatchmakingStep {
  label: string;
  done: boolean;
  active: boolean;
}

function StepIndicator({ steps }: { steps: MatchmakingStep[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.12, ease: 'easeOut' }}
          className="flex items-center gap-3"
        >
          <div
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-300 ${
              step.done
                ? 'bg-emerald-500/20 text-emerald-400'
                : step.active
                  ? 'bg-violet-500/20 text-violet-400 animate-pulse'
                  : 'bg-[#1e2940] text-[#475569]'
            }`}
          >
            {step.done ? '✓' : step.active ? '·' : i + 1}
          </div>
          <span
            className={`text-sm font-medium transition-colors duration-300 ${
              step.done
                ? 'text-emerald-400/80'
                : step.active
                  ? 'text-[#e2e8f0]'
                  : 'text-[#475569]'
            }`}
          >
            {step.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function RotatingTips() {
  const tips = useTips();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tips.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={index}
        className="text-center text-xs text-[#475569]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {tips[index]}
      </motion.p>
    </AnimatePresence>
  );
}

export function LobbyScreenView({
  status,
  connectionError,
  nickname,
  myPlayer,
  opponent,
  waitingForOpponent,
  onLeave,
}: LobbyScreenViewProps) {
  const { t } = useTranslation();

  const hasTeam = myPlayer?.team && myPlayer.team.length > 0;
  const opponentJoined = !waitingForOpponent;
  const opponentHasTeam = opponent?.team && opponent.team.length > 0;

  const steps: MatchmakingStep[] = [
    {
      label: t('lobby.stepCreating'),
      done: true,
      active: false,
    },
    {
      label: t('lobby.stepWaiting'),
      done: opponentJoined,
      active: !opponentJoined,
    },
    {
      label: t('lobby.stepAssigning'),
      done: !!(hasTeam && opponentHasTeam),
      active: opponentJoined && !(hasTeam && opponentHasTeam),
    },
  ];

  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center p-4 bg-[#080c14]">
      <div className="w-full max-w-sm space-y-8">
        {/* Connection warning */}
        {status !== 'connected' && (
          <div>
            {status === 'error' && connectionError ? (
              <div className="alert-banner alert-banner--error">
                {connectionError}
              </div>
            ) : (
              <ConnectionDot status={status} />
            )}
          </div>
        )}

        {/* Spinner */}
        <MatchmakingSpinner />

        {/* Title */}
        <div className="text-center">
          <h2 className="screen-heading mb-2">{t('lobby.matchmaking')}</h2>
          <p className="screen-subtitle">
            {waitingForOpponent
              ? t('lobby.waitingForOpponent')
              : t('lobby.bothInLobby')}
          </p>
        </div>

        {/* Player badges */}
        <div className="flex flex-col items-center gap-2">
          {/* My badge — violet */}
          <div className="flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.06] px-4 py-2">
            <div className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
            <span className="text-sm font-bold text-violet-300/90">
              {nickname ?? '???'}
            </span>
          </div>

          {/* Opponent badge — rose, animates in */}
          <AnimatePresence>
            {opponentJoined && opponent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/[0.06] px-4 py-2"
              >
                <div className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                <span className="text-sm font-bold text-rose-300/90">
                  {opponent.nickname}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress steps */}
        <div className="rounded-xl border border-[#1e2940] bg-[#0f1420] p-5">
          <StepIndicator steps={steps} />
        </div>

        {/* Tips */}
        <RotatingTips />

        {/* Leave */}
        <button onClick={onLeave} className="ghost-btn w-full">
          {t('lobby.leave')}
        </button>
      </div>
    </div>
  );
}
