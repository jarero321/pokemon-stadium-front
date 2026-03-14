'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type PokeballState = 'idle' | 'throwing';

interface PokeballProps {
  state?: PokeballState;
  size?: number;
  onComplete?: () => void;
}

const THROW_DURATION = 0.6;
const FLASH_DURATION = 0.5;

export function Pokeball({
  state = 'idle',
  size = 48,
  onComplete,
}: PokeballProps) {
  const [showFlash, setShowFlash] = useState(false);

  if (state === 'idle') return null;

  return (
    <AnimatePresence>
      {state === 'throwing' && (
        <motion.div
          className="pokeball-container"
          style={{ width: size, height: size }}
          initial={{ y: -60, scale: 0.6, opacity: 0 }}
          animate={{
            y: [null, -40, 8, -4, 0],
            scale: [null, 0.9, 1, 1, 1],
            opacity: [null, 1, 1, 1, 1],
          }}
          transition={{
            duration: THROW_DURATION,
            ease: [0.25, 0.46, 0.45, 0.94],
            times: [0, 0.3, 0.6, 0.8, 1],
          }}
          onAnimationComplete={() => setShowFlash(true)}
        >
          <motion.div
            className="pokeball"
            style={{ width: size, height: size }}
            initial={{ rotate: 0 }}
            animate={{ rotate: 720 }}
            transition={{ duration: THROW_DURATION, ease: 'linear' }}
          >
            <div className="pokeball__top" />
            <div className="pokeball__band">
              <div className="pokeball__button" />
            </div>
            <div className="pokeball__bottom" />
          </motion.div>

          {showFlash && (
            <motion.div
              className="pokeball__flash"
              style={{
                position: 'absolute',
                inset: '-50%',
                background:
                  'radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%)',
                zIndex: 10,
                pointerEvents: 'none',
              }}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.3, 1, 2],
              }}
              transition={{
                duration: FLASH_DURATION,
                ease: 'easeOut',
                times: [0, 0.3, 1],
              }}
              onAnimationComplete={() => onComplete?.()}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
