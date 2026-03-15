'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DURATION, EASE } from '@/lib/tokens';

type AttackStyle = 'blaze' | 'aqua' | 'bolt' | 'mystic' | 'strike' | 'slash';

const TYPE_TO_STYLE: Record<string, AttackStyle> = {
  fire: 'blaze',
  dragon: 'blaze',
  water: 'aqua',
  ice: 'aqua',
  electric: 'bolt',
  psychic: 'mystic',
  fairy: 'mystic',
  ghost: 'mystic',
  dark: 'mystic',
  poison: 'mystic',
  normal: 'slash',
  rock: 'slash',
  steel: 'slash',
  bug: 'slash',
  grass: 'slash',
  flying: 'slash',
};

function getStyle(type: string): AttackStyle {
  return TYPE_TO_STYLE[type] ?? 'strike';
}

const LAYER: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  borderRadius: 'inherit',
};

function BlazeEffect({ onComplete }: { onComplete?: () => void }) {
  return (
    <>
      {/* Expanding radial burst */}
      <motion.div
        style={{
          ...LAYER,
          background:
            'radial-gradient(circle at center, color-mix(in srgb, var(--atk-color) 80%, white 20%) 0%, var(--atk-color) 30%, transparent 65%)',
        }}
        initial={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
        animate={{
          opacity: [0, 0.9, 0.7, 0],
          clipPath: [
            'circle(0% at 50% 50%)',
            'circle(30% at 50% 50%)',
            'circle(55% at 50% 50%)',
            'circle(75% at 50% 50%)',
          ],
        }}
        transition={{
          duration: DURATION.burst,
          ease: 'easeOut',
          times: [0, 0.15, 0.5, 1],
        }}
      />

      {/* Inner glow */}
      <motion.div
        style={{
          ...LAYER,
          inset: '10%',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,255,200,0.8) 0%, var(--atk-color) 35%, transparent 65%)',
        }}
        initial={{ opacity: 0, scale: 0.3, filter: 'blur(4px)' }}
        animate={{
          opacity: [0, 1, 0.6, 0],
          scale: [0.3, 1, 1.4, 2],
          filter: ['blur(4px)', 'blur(4px)', 'blur(6px)', 'blur(10px)'],
        }}
        transition={{
          duration: DURATION.burst,
          ease: 'easeOut',
          times: [0, 0.2, 0.6, 1],
        }}
      />

      {/* Embers */}
      <motion.div
        style={{
          ...LAYER,
          inset: '-10%',
          background:
            'radial-gradient(circle at 30% 25%, var(--atk-color), transparent 40%), radial-gradient(circle at 70% 35%, color-mix(in srgb, var(--atk-color) 60%, white 40%), transparent 35%), radial-gradient(circle at 50% 70%, var(--atk-color), transparent 45%)',
          filter: 'blur(6px)',
        }}
        initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
        animate={{
          opacity: [0, 0.8, 0],
          scale: [0.5, 1, 1.5],
          rotate: [0, 15, 30],
        }}
        transition={{
          duration: DURATION.burst,
          ease: 'easeOut',
          times: [0, 0.25, 1],
        }}
        onAnimationComplete={onComplete}
      />
    </>
  );
}

function AquaEffect({ onComplete }: { onComplete?: () => void }) {
  return (
    <>
      {/* Circular wave expansion */}
      <motion.div
        style={{
          ...LAYER,
          background:
            'radial-gradient(circle at center, color-mix(in srgb, var(--atk-color) 60%, white 40%) 0%, var(--atk-color) 25%, transparent 55%)',
        }}
        initial={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
        animate={{
          opacity: [0, 0.7, 0],
          clipPath: [
            'circle(0% at 50% 50%)',
            'circle(35% at 50% 50%)',
            'circle(100% at 50% 50%)',
          ],
        }}
        transition={{
          duration: DURATION.burst,
          ease: 'easeOut',
          times: [0, 0.25, 1],
        }}
      />

      {/* Ring 1 */}
      <motion.div
        style={{
          ...LAYER,
          inset: '10%',
          borderRadius: '50%',
          border: '2px solid var(--atk-color)',
          boxShadow: '0 0 12px var(--atk-color)',
        }}
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: [0, 0.7, 0], scale: [0.2, 1, 1.8] }}
        transition={{
          duration: DURATION.burst,
          ease: 'easeOut',
          times: [0, 0.25, 1],
        }}
      />

      {/* Ring 2 (delayed) */}
      <motion.div
        style={{
          ...LAYER,
          inset: '10%',
          borderRadius: '50%',
          border: '2px solid var(--atk-color)',
          boxShadow: '0 0 12px var(--atk-color)',
        }}
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: [0, 0.7, 0], scale: [0.2, 1, 1.8] }}
        transition={{
          duration: DURATION.burst,
          ease: 'easeOut',
          times: [0, 0.25, 1],
          delay: 0.12,
        }}
        onAnimationComplete={onComplete}
      />
    </>
  );
}

function BoltEffect({ onComplete }: { onComplete?: () => void }) {
  return (
    <>
      {/* Flickering radial flash */}
      <motion.div
        style={{
          ...LAYER,
          background:
            'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--atk-color) 40%, white 60%) 0%, var(--atk-color) 20%, transparent 55%)',
        }}
        initial={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
        animate={{
          opacity: [0, 0.9, 0, 0.7, 0, 0.4, 0],
          clipPath: [
            'circle(0% at 50% 50%)',
            'circle(50% at 50% 50%)',
            'circle(50% at 50% 50%)',
            'circle(60% at 50% 50%)',
            'circle(60% at 50% 50%)',
            'circle(70% at 50% 50%)',
            'circle(75% at 50% 50%)',
          ],
        }}
        transition={{
          duration: DURATION.bolt,
          times: [0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.55],
          ease: 'linear',
        }}
      />

      {/* Lightning bolt shape */}
      <motion.div
        style={{
          ...LAYER,
          inset: undefined,
          position: 'absolute',
          top: '5%',
          left: '35%',
          width: '30%',
          height: '90%',
          clipPath:
            'polygon(50% 0%, 65% 30%, 85% 28%, 55% 55%, 72% 52%, 42% 100%, 38% 60%, 18% 62%, 48% 35%, 30% 38%)',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.95), var(--atk-color), rgba(255,255,255,0.9))',
          filter:
            'drop-shadow(0 0 8px var(--atk-color)) drop-shadow(0 0 16px var(--atk-color))',
        }}
        initial={{ opacity: 0, scaleY: 0, scaleX: 0.5 }}
        animate={{
          opacity: [0, 1, 1, 0.6, 0],
          scaleY: [0, 1, 1, 1.05, 1.1],
          scaleX: [0.5, 1, 1, 0.9, 0.7],
        }}
        transition={{
          duration: DURATION.bolt,
          ease: 'easeOut',
          times: [0, 0.1, 0.4, 0.6, 1],
        }}
      />

      {/* Electric sparks */}
      <motion.div
        style={{
          ...LAYER,
          inset: '15%',
          borderRadius: '50%',
          boxShadow: [
            '12px -8px 0 -4px var(--atk-color)',
            '-15px 10px 0 -4px color-mix(in srgb, var(--atk-color) 80%, white 20%)',
            '8px 14px 0 -5px var(--atk-color)',
            '-10px -12px 0 -4px color-mix(in srgb, var(--atk-color) 60%, white 40%)',
            '18px 4px 0 -5px var(--atk-color)',
            '-6px 18px 0 -5px var(--atk-color)',
          ].join(', '),
        }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{
          opacity: [0, 1, 0.7, 0],
          scale: [0.3, 0.8, 1.2, 1.8],
          filter: ['blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(2px)'],
        }}
        transition={{
          duration: DURATION.bolt,
          ease: 'easeOut',
          times: [0, 0.15, 0.5, 1],
        }}
        onAnimationComplete={onComplete}
      />
    </>
  );
}

function MysticEffect({ onComplete }: { onComplete?: () => void }) {
  return (
    <>
      {/* Ring 1 */}
      <motion.div
        style={{
          ...LAYER,
          inset: '20%',
          borderRadius: '50%',
          border: '2px solid var(--atk-color)',
          boxShadow:
            '0 0 16px var(--atk-color), inset 0 0 16px color-mix(in srgb, var(--atk-color) 40%, transparent 60%)',
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [1, 0], scale: [0, 2.2] }}
        transition={{ duration: DURATION.mystic, ease: 'easeOut' }}
      />

      {/* Ring 2 (delayed) */}
      <motion.div
        style={{
          ...LAYER,
          inset: '20%',
          borderRadius: '50%',
          border: '2px solid var(--atk-color)',
          boxShadow:
            '0 0 16px var(--atk-color), inset 0 0 16px color-mix(in srgb, var(--atk-color) 40%, transparent 60%)',
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [1, 0], scale: [0, 2.2] }}
        transition={{ duration: DURATION.mystic, ease: 'easeOut', delay: 0.18 }}
        onAnimationComplete={onComplete}
      />
    </>
  );
}

function StrikeEffect({ onComplete }: { onComplete?: () => void }) {
  return (
    <>
      {/* Brief circular flash */}
      <motion.div
        style={{
          ...LAYER,
          background:
            'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 40%)',
        }}
        initial={{ opacity: 0.8, clipPath: 'circle(0% at 50% 50%)' }}
        animate={{
          opacity: [0.8, 0.5, 0],
          clipPath: [
            'circle(0% at 50% 50%)',
            'circle(45% at 50% 50%)',
            'circle(60% at 50% 50%)',
          ],
        }}
        transition={{
          duration: DURATION.strike,
          ease: 'easeOut',
          times: [0, 0.15, 0.3],
        }}
      />

      {/* Diagonal slash */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '140%',
          height: 4,
          borderRadius: 2,
          background:
            'linear-gradient(90deg, transparent 0%, var(--atk-color) 20%, rgba(255,255,255,0.95) 45%, rgba(255,255,255,0.95) 55%, var(--atk-color) 80%, transparent 100%)',
          filter: 'drop-shadow(0 0 6px var(--atk-color))',
          pointerEvents: 'none',
        }}
        initial={{
          x: '-50%',
          y: '-50%',
          rotate: -25,
          scaleX: 0,
          opacity: 0,
        }}
        animate={{
          opacity: [0, 1, 1, 0.7, 0],
          scaleX: [0, 1, 1, 1, 1.1],
        }}
        transition={{
          duration: DURATION.strike,
          ease: 'easeOut',
          times: [0, 0.08, 0.2, 0.6, 1],
        }}
      />

      {/* Impact burst */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.9) 0%, color-mix(in srgb, var(--atk-color) 70%, white 30%) 30%, var(--atk-color) 55%, transparent 70%)',
          filter: 'drop-shadow(0 0 10px var(--atk-color))',
          pointerEvents: 'none',
        }}
        initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
        animate={{
          opacity: [0, 1, 0.9, 0],
          scale: [0, 1, 1, 2.5],
          filter: [
            'drop-shadow(0 0 10px var(--atk-color))',
            'drop-shadow(0 0 10px var(--atk-color))',
            'drop-shadow(0 0 10px var(--atk-color))',
            'drop-shadow(0 0 10px var(--atk-color)) blur(4px)',
          ],
        }}
        transition={{
          duration: DURATION.strike,
          ease: 'easeOut',
          times: [0, 0.1, 0.3, 1],
        }}
        onAnimationComplete={onComplete}
      />
    </>
  );
}

function SlashEffect({ onComplete }: { onComplete?: () => void }) {
  const slashes = [
    { rotate: -35, delay: 0 },
    { rotate: 25, delay: 0.08 },
    { rotate: -5, delay: 0.16 },
  ];

  return (
    <>
      {slashes.map((s, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '150%',
            height: 3,
            borderRadius: 2,
            background:
              'linear-gradient(90deg, transparent 0%, var(--atk-color) 15%, rgba(255,255,255,0.95) 45%, rgba(255,255,255,0.95) 55%, var(--atk-color) 85%, transparent 100%)',
            filter: 'drop-shadow(0 0 6px var(--atk-color))',
            pointerEvents: 'none',
          }}
          initial={{
            x: '-50%',
            y: '-50%',
            rotate: s.rotate,
            scaleX: 0,
            opacity: 0,
          }}
          animate={{
            opacity: [0, 1, 1, 0.5, 0],
            scaleX: [0, 1.1, 1, 0.95, 0.8],
          }}
          transition={{
            duration: DURATION.strike,
            ease: EASE.attack,
            times: [0, 0.12, 0.3, 0.7, 1],
            delay: s.delay,
          }}
          onAnimationComplete={
            i === slashes.length - 1 ? onComplete : undefined
          }
        />
      ))}

      {/* Brief flash at impact */}
      <motion.div
        style={{
          ...LAYER,
          background:
            'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25) 0%, transparent 50%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{
          duration: DURATION.strike,
          ease: 'easeOut',
          times: [0, 0.15, 0.5],
        }}
      />
    </>
  );
}

const EFFECT_COMPONENTS: Record<
  AttackStyle,
  React.FC<{ onComplete?: () => void }>
> = {
  blaze: BlazeEffect,
  aqua: AquaEffect,
  bolt: BoltEffect,
  mystic: MysticEffect,
  strike: StrikeEffect,
  slash: SlashEffect,
};

interface AttackEffectProps {
  types: string[];
  trigger: number;
  onComplete?: () => void;
}

export function AttackEffect({
  types,
  trigger,
  onComplete,
}: AttackEffectProps) {
  const [playing, setPlaying] = useState(false);
  const [selectedType, setSelectedType] = useState('normal');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (trigger <= 0) return;
    const picked =
      types[Math.floor(Math.random() * types.length)]?.toLowerCase() ??
      'normal';
    setSelectedType(picked); // eslint-disable-line react-hooks/set-state-in-effect -- syncs trigger prop to playing state
    setPlaying(true);
  }, [trigger, types]);

  const handleComplete = () => {
    setPlaying(false);
    onCompleteRef.current?.();
  };

  const style = getStyle(selectedType);
  const EffectComponent = EFFECT_COMPONENTS[style];

  return (
    <AnimatePresence>
      {playing && (
        <motion.div
          key={trigger}
          className="absolute inset-0 pointer-events-none z-10 rounded-[inherit]"
          style={
            {
              '--atk-color': `var(--color-type-${selectedType})`,
            } as React.CSSProperties
          }
          initial={false}
          animate={{}}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.05 }}
        >
          <EffectComponent onComplete={handleComplete} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
