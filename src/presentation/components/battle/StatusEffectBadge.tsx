'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { DURATION } from '@/lib/tokens';

export type StatusEffect = 'psn' | 'brn' | 'par' | 'frz' | 'slp' | 'cnf';

interface StatusEffectBadgeProps {
  statuses: StatusEffect[];
}

const STATUS_CONFIG: Record<
  StatusEffect,
  { icon: string; label: string; fullName: string; colorVar: string }
> = {
  psn: {
    icon: '☠',
    label: 'PSN',
    fullName: 'Poisoned',
    colorVar: 'var(--color-type-poison)',
  },
  brn: {
    icon: '🔥',
    label: 'BRN',
    fullName: 'Burned',
    colorVar: 'var(--color-type-fire)',
  },
  par: {
    icon: '⚡',
    label: 'PAR',
    fullName: 'Paralyzed',
    colorVar: 'var(--color-type-electric)',
  },
  frz: {
    icon: '❄',
    label: 'FRZ',
    fullName: 'Frozen',
    colorVar: 'var(--color-type-ice)',
  },
  slp: {
    icon: '💤',
    label: 'SLP',
    fullName: 'Asleep',
    colorVar: 'var(--color-type-dark)',
  },
  cnf: { icon: '🌀', label: 'CNF', fullName: 'Confused', colorVar: '#e879f9' },
};

export function StatusEffectBadge({ statuses }: StatusEffectBadgeProps) {
  if (statuses.length === 0) return null;

  return (
    <div
      className="flex gap-1"
      style={{ paddingLeft: 8, marginTop: 4, marginBottom: 2 }}
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {statuses.map((status) => {
          const config = STATUS_CONFIG[status];
          return (
            <motion.span
              key={status}
              className={`status-badge status-badge--${status}`}
              style={
                { '--status-color': config.colorVar } as React.CSSProperties
              }
              role="status"
              aria-label={config.fullName}
              title={config.fullName}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0, x: -4 }}
              transition={{
                type: 'spring',
                duration: DURATION.slow,
                bounce: 0.4,
              }}
            >
              <span aria-hidden="true" className="status-badge__icon">
                {config.icon}
              </span>
              {config.label}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
