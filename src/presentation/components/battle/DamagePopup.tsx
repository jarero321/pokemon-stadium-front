'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { DURATION, EASE } from '@/lib/tokens';

type DamageVariant = 'normal' | 'superEffective' | 'notEffective' | 'critical';

interface DamagePopupEntry {
  id: string | number;
  damage: number;
  targetMaxHp: number;
  variant: DamageVariant;
  isCritical?: boolean;
  side: 'player' | 'opponent';
}

interface DamagePopupProps {
  popups: DamagePopupEntry[];
  onComplete?: (id: string | number) => void;
}

const VARIANT_COLORS: Record<DamageVariant, string> = {
  normal: '#f1f5f9',
  superEffective: 'var(--color-neon-warning)',
  notEffective: '#93c5fd',
  critical: '#fb923c',
};

function getDamageSize(damage: number, maxHp: number): number {
  const ratio = damage / maxHp;
  if (ratio >= 0.5) return 38;
  if (ratio >= 0.3) return 30;
  if (ratio >= 0.15) return 24;
  if (ratio >= 0.05) return 18;
  return 14;
}

export function DamagePopup({ popups, onComplete }: DamagePopupProps) {
  return (
    <AnimatePresence>
      {popups.map((popup) => {
        const fontSize = getDamageSize(popup.damage, popup.targetMaxHp);
        const color = VARIANT_COLORS[popup.variant];
        const isOpponent = popup.side === 'opponent';

        return (
          <motion.div
            key={popup.id}
            className="pointer-events-none z-20 absolute flex flex-col items-center"
            style={{
              [isOpponent ? 'top' : 'bottom']: '30%',
              [isOpponent ? 'right' : 'left']: '25%',
            }}
            initial={{ scale: 0.5, opacity: 0, y: 0 }}
            animate={{
              scale: [0.5, 1.15, 1.0, 1.0],
              opacity: [0, 1, 1, 0],
              y: [0, -12, -24, -48],
            }}
            transition={{
              duration: 1.2,
              times: [0, 0.12, 0.37, 1],
              ease: 'easeOut',
            }}
            onAnimationComplete={() => onComplete?.(popup.id)}
          >
            {popup.isCritical && (
              <motion.span
                className="text-[10px] font-black tracking-[0.12em] uppercase text-orange-400 [text-shadow:0_0_8px_rgba(251,146,60,0.60)] mb-0.5"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.05,
                  duration: DURATION.slow,
                  ease: EASE.bounce,
                }}
              >
                CRITICAL!
              </motion.span>
            )}
            <span
              className="leading-none"
              style={{
                fontSize,
                color,
                fontWeight: 900,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.02em',
                textShadow: `0 0 16px ${color}, 0 2px 4px rgba(0,0,0,0.5)`,
              }}
            >
              {popup.damage}
            </span>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
