'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  motion,
  type TargetAndTransition,
  type Transition,
} from 'framer-motion';
import { getSpriteUrl } from './types';
import { Pokeball } from './Pokeball';
import type { PokeballState } from './Pokeball';
import { DURATION, EASE } from '@/lib/tokens';

export type SpriteAnimation =
  | 'idle'
  | 'entering'
  | 'damage'
  | 'fainting'
  | 'waiting'
  | 'attacking'
  | 'critical';

interface PokemonSpriteProps {
  name: string;
  back?: boolean;
  size?: number;
  animation?: SpriteAnimation;
  /** Incremented to re-trigger the same animation */
  animationKey?: number;
  onAnimationEnd?: () => void;
}

const ANIM_DAMAGE = {
  initial: { x: 0, opacity: 1 },
  animate: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    opacity: [1, 0.6, 1, 0.6, 1, 0.8, 1, 1],
  },
  transition: { duration: DURATION.spriteHit, ease: 'easeOut' as const },
};

const ANIM_FAINTING = {
  initial: { y: 0, scale: 1, opacity: 1 },
  animate: { y: 40, scale: 0.8, opacity: 0 },
  transition: { duration: DURATION.fainting, ease: EASE.ko },
};

const ANIM_ENTERING = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: [0, 1.15, 1], opacity: [0, 1, 1] },
  transition: { duration: DURATION.hpFill, ease: EASE.bounce },
};

const ANIM_IDLE = {
  initial: false as const,
  animate: { x: 0, y: 0, scale: 1, opacity: 1 },
  transition: { duration: DURATION.fast },
};

const ANIM_WAITING = {
  initial: false as const,
  animate: {
    y: [0, -2, 0, 2, 0],
    opacity: [0.85, 0.9, 0.85, 0.9, 0.85],
  },
  transition: {
    duration: 3.5,
    ease: 'easeInOut' as const,
    repeat: Infinity,
  },
};

const ANIM_ATTACKING = {
  initial: { x: 0 },
  animate: {
    x: [0, 12, -4, 0],
  },
  transition: {
    duration: DURATION.blaze,
    ease: EASE.attack,
    times: [0, 0.35, 0.7, 1],
  },
};

const ANIM_CRITICAL = {
  initial: { x: 0, opacity: 1 },
  animate: {
    x: [0, -10, 10, -8, 8, -5, 5, 0],
    opacity: [1, 0.4, 1, 0.4, 1, 0.6, 1, 1],
  },
  transition: { duration: DURATION.spriteHit, ease: 'easeOut' as const },
};

interface SpriteAnimConfig {
  initial: TargetAndTransition | boolean;
  animate: TargetAndTransition;
  transition: Transition;
}

const ANIM_MAP: Record<SpriteAnimation, SpriteAnimConfig> = {
  damage: ANIM_DAMAGE,
  fainting: ANIM_FAINTING,
  entering: ANIM_ENTERING,
  idle: ANIM_IDLE,
  waiting: ANIM_WAITING,
  attacking: ANIM_ATTACKING,
  critical: ANIM_CRITICAL,
};

export function PokemonSprite({
  name,
  back = false,
  size = 128,
  animation = 'idle',
  animationKey = 0,
  onAnimationEnd,
}: PokemonSpriteProps) {
  const [pokeballState, setPokeballState] = useState<PokeballState>('idle');
  const [spriteVisible, setSpriteVisible] = useState(animation !== 'entering');
  const onAnimEndRef = useRef(onAnimationEnd);
  const animRef = useRef(animation);

  useEffect(() => {
    onAnimEndRef.current = onAnimationEnd;
  }, [onAnimationEnd]);

  useEffect(() => {
    animRef.current = animation;
  }, [animation]);

  const spriteUrl = getSpriteUrl(name, back);

  const handlePokeballComplete = useCallback(() => {
    setSpriteVisible(true);
  }, []);

  // Pokeball + visibility setup — deferred to avoid cascading render
  useEffect(() => {
    if (animation === 'entering') {
      queueMicrotask(() => {
        setSpriteVisible(false);
        setPokeballState('idle');
        requestAnimationFrame(() => setPokeballState('throwing'));
      });
    } else if (animation === 'idle') {
      queueMicrotask(() => setSpriteVisible(true));
    }
  }, [animation, animationKey]);

  const handleComplete = useCallback(() => {
    const anim = animRef.current;
    if (anim === 'fainting') {
      setSpriteVisible(false);
    }
    if (anim !== 'idle') {
      onAnimEndRef.current?.();
    }
  }, []);

  const config = ANIM_MAP[animation] ?? ANIM_IDLE;

  return (
    <div
      className="pokemon-sprite"
      style={{ width: size, height: size, position: 'relative' }}
    >
      {/* Pokeball throw animation */}
      {!spriteVisible && animation === 'entering' && (
        <div className="pokemon-sprite__pokeball">
          <Pokeball
            state={pokeballState}
            size={size * 0.35}
            onComplete={handlePokeballComplete}
          />
        </div>
      )}

      {/* Pokemon sprite — Framer Motion handles all animations */}
      {spriteVisible && (
        <motion.img
          key={animationKey}
          src={spriteUrl}
          alt={name}
          className="pokemon-sprite__img"
          initial={config.initial}
          animate={config.animate}
          transition={config.transition}
          onAnimationComplete={handleComplete}
          style={{
            width: size,
            height: size,
            imageRendering: 'pixelated' as const,
          }}
          draggable={false}
        />
      )}
    </div>
  );
}
