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

// Gold-dominant palette for victory celebration.
// 3 golds + 1 violet (brand) + 1 emerald + 1 rose + 1 white = 7 distinct colors
const CONFETTI_COLORS = [
  '#FBBF24', // amber-400 — gold primary
  '#FCD34D', // amber-300 — gold light
  '#F59E0B', // amber-500 — gold deep
  '#A78BFA', // violet — brand accent
  '#34D399', // emerald — celebration green
  '#FB7185', // rose — warm pop
  '#F1F5F9', // near-white — sparkle
];

function seededValue(index: number, offset: number, range: number): number {
  const hash = ((index * 2654435761 + offset * 40503) >>> 0) % 10000;
  return (hash / 10000) * range;
}

function generateParticles() {
  // Two waves: burst (0-0.6s delay) + cascade (0.8-2.2s delay)
  const TOTAL = 100;
  const BURST = 60;

  return Array.from({ length: TOTAL }, (_, i) => {
    const isBurst = i < BURST;

    // 5 shape types: square, tall rect, wide rect, circle, diamond
    const shapeIndex = i % 5;
    const borderRadius =
      shapeIndex === 3
        ? '50%' // circle
        : shapeIndex === 4
          ? '2px' // diamond (rotated square)
          : '1px'; // rectangles
    const extraRotation = shapeIndex === 4 ? 45 : 0;

    const sizeBase = shapeIndex === 3 ? 5 : 4;
    const w = sizeBase + seededValue(i, 2, shapeIndex <= 2 ? 5 : 4);
    const h =
      shapeIndex === 1
        ? w * 2.5 // tall
        : shapeIndex === 2
          ? w * 0.4 // wide
          : w;

    return {
      id: i,
      x: seededValue(i, 1, 100),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: w,
      height: h,
      delay: isBurst
        ? seededValue(i, 4, 0.6) // burst: 0–0.6s
        : 0.8 + seededValue(i, 4, 1.4), // cascade: 0.8–2.2s
      duration: 2.5 + seededValue(i, 5, 3.5),
      rotation: extraRotation + 360 + seededValue(i, 6, 1080),
      wobble: 15 + seededValue(i, 7, 50),
      borderRadius,
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
          isWinnerRow ? 'text-emerald-400/70' : 'text-rose-400/50'
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
            <div className="flex h-12 w-12 items-center justify-center">
              <Image
                src={p.sprite}
                alt={p.name}
                width={48}
                height={48}
                unoptimized
                className="pixelated object-contain"
                style={
                  p.defeated
                    ? { filter: 'grayscale(1) brightness(0.4)', opacity: 0.5 }
                    : undefined
                }
              />
            </div>
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
              ? 'bg-[rgba(4,6,14,0.92)]'
              : '[background:radial-gradient(ellipse_at_center,rgba(244,63,94,0.05)_0%,transparent_60%),rgba(4,6,14,0.96)]'
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
                : 'text-rose-400/80'
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
              : reason === 'surrender'
                ? t('result.surrendered')
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
                <div className="flex h-32 w-32 items-center justify-center">
                  <Image
                    src={pokemonSprite}
                    alt={pokemonName ?? 'Pokemon'}
                    width={128}
                    height={128}
                    unoptimized
                    className="pixelated object-contain"
                    style={
                      isVictory
                        ? undefined
                        : { filter: 'grayscale(0.6) brightness(0.65)' }
                    }
                  />
                </div>
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
                <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#475569]">
                  {stat.label}
                </span>
                <span
                  className={`victory-overlay__stat-value text-[28px] max-sm:text-[22px] font-black font-mono tabular-nums text-[#e2e8f0] ${
                    isVictory
                      ? '[text-shadow:0_0_12px_rgba(250,204,21,0.25)]'
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
              className="battle-btn battle-btn--success min-w-[160px]"
              autoFocus
            >
              {t('result.playAgain')}
            </button>
            <button onClick={onExit} className="ghost-btn min-w-[160px]">
              {t('result.exitToMenu')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
