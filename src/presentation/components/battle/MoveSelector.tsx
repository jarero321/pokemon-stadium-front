'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TypeBadge } from '../ui/TypeBadge';
import { DURATION, EASE, getTypeColor } from '@/lib/tokens';

export interface BattleMove {
  name: string;
  type: string;
  power: number;
  pp: number;
  maxPp: number;
}

interface MoveSelectorProps {
  moves: BattleMove[];
  onMoveSelect: (moveIndex: number) => void;
  onBack: () => void;
  disabled?: boolean;
  selectedIndex?: number | null;
}

function getPpColor(pp: number, maxPp: number): string {
  const ratio = pp / maxPp;
  if (ratio > 0.5) return 'rgba(255,255,255,0.50)';
  if (ratio > 0.25) return 'var(--color-neon-warning)';
  if (ratio > 0) return 'var(--color-neon-danger)';
  return 'rgba(255,255,255,0.18)';
}

export function MoveSelector({
  moves,
  onMoveSelect,
  onBack,
  disabled = false,
  selectedIndex = null,
}: MoveSelectorProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="p-2 px-2.5 flex flex-col gap-1.5 min-w-[165px]"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '-100%', opacity: 0 }}
        transition={{ duration: DURATION.slow, ease: EASE.snappy }}
      >
        {/* Header */}
        <div className="flex items-center justify-start">
          <button
            onClick={onBack}
            className="py-1 px-2 rounded-md text-[11px] font-extrabold text-white/40 bg-white/[0.03] border border-white/[0.06] cursor-pointer transition-all duration-150 text-center uppercase tracking-wide hover:bg-white/[0.06] hover:text-white/60 hover:border-white/[0.12]"
          >
            ‹ Back
          </button>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {moves.map((move, index) => {
            const isDisabled = disabled || move.pp <= 0;
            const isSelected = selectedIndex === index;
            const typeColor = getTypeColor(move.type);

            return (
              <motion.button
                key={index}
                className={`move-cell ${isDisabled ? 'move-cell--disabled' : ''} ${isSelected ? 'move-cell--selected' : ''}`}
                style={
                  { '--move-type-color': typeColor } as React.CSSProperties
                }
                data-type={move.type.toLowerCase()}
                onClick={() => !isDisabled && onMoveSelect(index)}
                disabled={isDisabled}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: DURATION.normal,
                  ease: EASE.bounce,
                  delay: index * 0.04,
                }}
                aria-label={`Use ${move.name} (${move.type} type, power ${move.power}, ${move.pp} of ${move.maxPp} PP)`}
              >
                <span className="move-cell__name">{move.name}</span>
                <TypeBadge type={move.type} iconOnly />
                <span className="text-[11px] font-extrabold text-white/70 tabular-nums">
                  <span className="text-[8px] font-bold tracking-widest text-white/35 mr-0.5">
                    PWR
                  </span>
                  {move.power}
                </span>
                <span
                  className="text-[9px] font-bold tabular-nums transition-colors duration-150"
                  style={{ color: getPpColor(move.pp, move.maxPp) }}
                >
                  {move.pp}/{move.maxPp} PP
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
