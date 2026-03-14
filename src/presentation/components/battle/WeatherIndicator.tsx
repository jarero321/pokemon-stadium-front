'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { DURATION, EASE } from '@/lib/tokens';

export type WeatherCondition = 'none' | 'rain' | 'sun' | 'sandstorm' | 'hail';

interface WeatherIndicatorProps {
  weather: WeatherCondition;
}

const WEATHER_CONFIG: Record<
  Exclude<WeatherCondition, 'none'>,
  { icon: string; label: string; colorVar: string }
> = {
  rain: { icon: '🌧', label: 'Rain', colorVar: 'var(--color-type-water)' },
  sun: { icon: '☀', label: 'Sun', colorVar: 'var(--color-type-fire)' },
  sandstorm: {
    icon: '🌪',
    label: 'Sandstorm',
    colorVar: 'var(--color-type-ground)',
  },
  hail: { icon: '🌨', label: 'Hail', colorVar: 'var(--color-type-ice)' },
};

export function WeatherIndicator({ weather }: WeatherIndicatorProps) {
  const config = weather !== 'none' ? WEATHER_CONFIG[weather] : null;

  return (
    <>
      {/* Weather pill */}
      <AnimatePresence mode="wait">
        {config && (
          <motion.div
            key={weather}
            className={`weather-indicator weather-indicator--${weather}`}
            style={
              { '--weather-color': config.colorVar } as React.CSSProperties
            }
            role="status"
            aria-label={`${config.label} weather active`}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8, scale: 0.9 }}
            transition={{ duration: DURATION.slow, ease: EASE.snappy }}
          >
            <span aria-hidden="true">{config.icon}</span>
            {config.label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Arena tint overlay */}
      <AnimatePresence>
        {config && (
          <motion.div
            key={`tint-${weather}`}
            className="arena-weather-tint"
            style={
              { '--weather-color': config.colorVar } as React.CSSProperties
            }
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.burst }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
