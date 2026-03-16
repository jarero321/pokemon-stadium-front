'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { TypeBadge } from '../ui/TypeBadge';
import { getHpColor, DURATION, EASE } from '@/lib/tokens';

interface StatBarProps {
  name: string;
  types: string[];
  hp: number;
  maxHp: number;
  attack?: number;
  defense?: number;
  speed?: number;
  variant: 'player' | 'opponent';
}

export function StatBar({
  name,
  types,
  hp,
  maxHp,
  attack,
  defense,
  speed,
  variant,
}: StatBarProps) {
  const isPlayer = variant === 'player';
  const ratio = hp / maxHp;
  const hpColor = getHpColor(ratio);
  const hpPct = ratio * 100;

  const ghostWidth = useMotionValue(hpPct);
  const prevHpRef = useRef(hp);

  // Ghost bar: Framer Motion animate — useEffect only to track prev HP
  useEffect(() => {
    if (hp !== prevHpRef.current) {
      if (hp < prevHpRef.current) {
        animate(ghostWidth, hpPct, {
          duration: DURATION.ghostSlide,
          ease: EASE.snappy,
          delay: DURATION.hpGhost,
        });
      } else {
        ghostWidth.jump(hpPct);
      }
      prevHpRef.current = hp;
    }
  }, [hp, hpPct, ghostWidth]);

  const showStats = isPlayer && (attack || defense || speed);
  const maxStat = Math.max(attack ?? 0, defense ?? 0, speed ?? 0, 1);

  return (
    <div
      className={`info-panel info-panel--${variant} w-56 rounded-[14px] py-2.5 px-3.5 pb-3`}
    >
      {/* Header */}
      <div className="flex items-baseline justify-between mb-1 pl-2">
        <span className="text-[13px] font-extrabold tracking-wide text-slate-100 [text-shadow:0_0_12px_rgba(255,255,255,0.12)] uppercase">
          {name}
        </span>
      </div>

      {/* Type badges */}
      <div className="flex gap-1 mb-1 pl-2">
        {types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>

      {/* HP numbers */}
      <div className="flex justify-between items-center px-2">
        <span className="info-panel__hp-label" style={{ color: hpColor }}>
          HP
        </span>
        {isPlayer && (
          <span className="text-[10px] font-semibold text-slate-500 tabular-nums">
            {hp}/{maxHp}
          </span>
        )}
      </div>

      {/* HP bar */}
      <div className="hp-track mx-2 mt-1 mb-1">
        <motion.div
          className="absolute inset-0 right-auto rounded-full bg-white/18"
          style={{ width: ghostWidth.get() + '%' }}
          animate={{ width: ghostWidth.get() + '%' }}
        />
        <div
          className="info-panel__hp-fill"
          style={
            {
              width: `${hpPct}%`,
              '--hp-color': hpColor,
            } as React.CSSProperties
          }
        />
      </div>

      {/* Mini stats */}
      {showStats && (
        <div className="flex gap-2 mt-1.5 pt-1.5 border-t border-white/[0.06] mx-2">
          {[
            { label: 'ATK', value: attack! },
            { label: 'DEF', value: defense! },
            { label: 'SPD', value: speed! },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-px flex-1"
            >
              <span className="text-[8px] font-bold tracking-widest text-slate-500 uppercase">
                {s.label}
              </span>
              <span className="text-[11px] font-extrabold text-slate-400 tabular-nums">
                {s.value}
              </span>
              <div
                className="info-panel__stat-bar"
                style={
                  {
                    '--stat-pct': `${(s.value / maxStat) * 100}%`,
                  } as React.CSSProperties
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
