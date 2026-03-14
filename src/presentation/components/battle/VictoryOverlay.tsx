'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { TypeBadge } from '../ui/TypeBadge';
import { DURATION, EASE } from '@/lib/tokens';

export interface TeamPokemon {
  name: string;
  sprite: string;
  defeated: boolean;
}

interface VictoryOverlayProps {
  isVisible: boolean;
  isVictory: boolean;
  winnerName: string;
  pokemonSprite?: string;
  pokemonName?: string;
  pokemonTypes?: string[];
  totalTurns: number;
  totalKOs: number;
  totalDamage: number;
  reason?: string;
  onPlayAgain: () => void;
  onExit: () => void;
  myTeam?: TeamPokemon[];
  opponentTeam?: TeamPokemon[];
  myName?: string;
  opponentName?: string;
}

function AnimatedCounter({
  value,
  delay = 0,
}: {
  value: number;
  delay?: number;
}) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value <= 0) return;
    const controls = animate(motionVal, value, {
      duration: 0.8,
      ease: 'easeOut',
      delay,
    });
    return controls.stop;
  }, [value, delay, motionVal]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => setDisplay(v));
    return unsubscribe;
  }, [rounded]);

  return <>{display}</>;
}

const CONFETTI_COLORS = [
  '#facc15',
  '#4ade80',
  '#38bdf8',
  '#f9a8d4',
  '#fb923c',
  '#818cf8',
  '#c084fc',
  '#34d399',
];

function seededValue(index: number, offset: number, range: number): number {
  const hash = ((index * 2654435761 + offset * 40503) >>> 0) % 10000;
  return (hash / 10000) * range;
}

function generateParticles() {
  return Array.from({ length: 70 }, (_, i) => {
    const shapeIndex = i % 3;
    const borderRadius =
      shapeIndex === 0 ? '0%' : shapeIndex === 1 ? '0%' : '50%';
    const aspectRatio = shapeIndex === 1 ? 0.5 : 1;

    return {
      id: i,
      x: seededValue(i, 1, 100),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 4 + seededValue(i, 2, 6),
      height: (8 + seededValue(i, 3, 8)) * (shapeIndex === 1 ? 2 : 1),
      delay: seededValue(i, 4, 1.2),
      duration: 3.0 + seededValue(i, 5, 3),
      rotation: 360 + seededValue(i, 6, 720),
      wobble: 20 + seededValue(i, 7, 40),
      borderRadius,
      aspectRatio,
    };
  });
}

function ConfettiParticles() {
  const [particles] = useState(generateParticles);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={
            {
              '--confetti-x': `${p.x}%`,
              '--confetti-color': p.color,
              '--confetti-size': `${p.size}px`,
              '--confetti-height': `${p.height}px`,
              '--confetti-delay': `${p.delay}s`,
              '--confetti-duration': `${p.duration}s`,
              '--confetti-rotation': `${p.rotation}deg`,
              '--confetti-wobble': `${p.wobble}px`,
              borderRadius: p.borderRadius,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function TeamRow({
  team,
  label,
  isWinnerRow,
  delay,
}: {
  team: TeamPokemon[];
  label: string;
  isWinnerRow: boolean;
  delay: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: DURATION.slow, ease: EASE.snappy }}
    >
      <span
        className={`text-[10px] font-bold tracking-[0.12em] uppercase ${
          isWinnerRow ? 'text-green-400/70' : 'text-red-400/50'
        }`}
      >
        {label}
      </span>
      <div className="flex gap-3">
        {team.map((p, i) => (
          <motion.div
            key={p.name}
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + i * 0.08, duration: 0.3 }}
          >
            <Image
              src={p.sprite}
              alt={p.name}
              width={48}
              height={48}
              unoptimized
              className="pixelated"
              style={
                p.defeated
                  ? { filter: 'grayscale(1) brightness(0.4)', opacity: 0.5 }
                  : undefined
              }
            />
            <span
              className={`text-[9px] font-bold capitalize ${
                p.defeated ? 'text-white/25' : 'text-white/60'
              }`}
            >
              {p.name}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function VictoryOverlay({
  isVisible,
  isVictory,
  winnerName,
  pokemonSprite,
  pokemonName,
  pokemonTypes,
  totalTurns,
  totalKOs,
  totalDamage,
  reason,
  onPlayAgain,
  onExit,
  myTeam,
  opponentTeam,
  myName,
  opponentName,
}: VictoryOverlayProps) {
  const { t } = useTranslation();
  const hasTeams =
    myTeam && myTeam.length > 0 && opponentTeam && opponentTeam.length > 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 p-6 backdrop-blur-[16px] ${
            isVictory
              ? 'bg-[rgba(4,8,18,0.88)]'
              : 'bg-[rgba(4,4,12,0.94)] [background:radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.70)_100%),rgba(4,4,12,0.94)]'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Battle Result"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: DURATION.slow, ease: EASE.snappy }}
        >
          {isVictory && <ConfettiParticles />}

          {/* Title */}
          <motion.h1
            className={`victory-overlay__title text-[72px] max-sm:text-[48px] font-black uppercase tracking-wider leading-none ${
              isVictory
                ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent'
                : 'text-gray-400'
            }`}
            initial={
              isVictory ? { scale: 0, opacity: 0 } : { y: -20, opacity: 0 }
            }
            animate={
              isVictory ? { scale: 1, opacity: 1 } : { y: 0, opacity: 1 }
            }
            transition={{
              duration: isVictory ? DURATION.burst : DURATION.mystic,
              ease: isVictory ? EASE.bounce : EASE.ko,
              delay: 0.15,
            }}
          >
            {isVictory ? t('result.victory') : t('result.defeat')}
          </motion.h1>

          <motion.p
            className="text-xs text-white/55 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: DURATION.slow }}
          >
            {reason === 'opponent_disconnected'
              ? t('result.disconnected')
              : isVictory
                ? t('result.champion', { name: winnerName })
                : t('result.winsRound', { name: winnerName })}
          </motion.p>

          {/* Teams or single Pokemon spotlight */}
          {hasTeams ? (
            <div className="flex flex-col gap-4">
              <TeamRow
                team={myTeam}
                label={`${myName ?? t('common.you')} — ${isVictory ? t('result.winner') : t('result.loser')}`}
                isWinnerRow={isVictory}
                delay={0.35}
              />
              <TeamRow
                team={opponentTeam}
                label={`${opponentName ?? t('common.opponent')} — ${isVictory ? t('result.loser') : t('result.winner')}`}
                isWinnerRow={!isVictory}
                delay={0.5}
              />
            </div>
          ) : (
            <motion.div
              className={`flex flex-col items-center gap-2 ${
                isVictory
                  ? '[filter:drop-shadow(0_0_40px_rgba(250,204,21,0.15))]'
                  : '[filter:drop-shadow(0_0_30px_rgba(248,113,113,0.10))]'
              }`}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.35,
                duration: DURATION.slow,
                ease: EASE.snappy,
              }}
            >
              {pokemonSprite && (
                <Image
                  src={pokemonSprite}
                  alt={pokemonName ?? 'Pokemon'}
                  width={128}
                  height={128}
                  unoptimized
                  className="pixelated"
                  style={
                    isVictory
                      ? undefined
                      : { filter: 'grayscale(0.6) brightness(0.65)' }
                  }
                />
              )}
              {pokemonName && (
                <p className="text-base font-extrabold uppercase tracking-wide text-slate-100 [text-shadow:0_0_12px_rgba(255,255,255,0.20)]">
                  {pokemonName}
                </p>
              )}
              {pokemonTypes && (
                <div className="flex gap-1 justify-center mt-1">
                  {pokemonTypes.map((tp) => (
                    <TypeBadge key={tp} type={tp} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Stats */}
          <motion.div
            className="victory-overlay__stats flex justify-center gap-12 max-sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: DURATION.normal }}
          >
            {[
              { label: t('result.turns'), value: totalTurns },
              { label: t('result.pokemonKod'), value: totalKOs },
              { label: t('result.damageDealt'), value: totalDamage },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/35">
                  {stat.label}
                </span>
                <span
                  className={`victory-overlay__stat-value text-[28px] max-sm:text-[22px] font-black tabular-nums text-slate-100 ${
                    isVictory
                      ? '[text-shadow:0_0_12px_rgba(250,204,21,0.30)]'
                      : ''
                  }`}
                >
                  <AnimatedCounter value={stat.value} delay={0.5 + i * 0.15} />
                </span>
              </div>
            ))}
          </motion.div>

          {/* Buttons */}
          <motion.div
            className="victory-overlay__actions flex gap-4 mt-3 max-sm:flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.7,
              duration: DURATION.slow,
              ease: EASE.bounce,
            }}
          >
            <button
              onClick={onPlayAgain}
              className="battle-btn battle-btn--attack min-w-[160px]"
              autoFocus
            >
              {t('result.playAgain')}
            </button>
            <button
              onClick={onExit}
              className="battle-action-btn min-w-[160px]"
              style={
                { '--btn-neon': 'rgba(255,255,255,0.3)' } as React.CSSProperties
              }
            >
              {t('result.exitToMenu')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
