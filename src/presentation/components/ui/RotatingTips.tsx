'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface RotatingTipsProps {
  tips: string[];
  intervalMs?: number;
}

export function RotatingTips({ tips, intervalMs = 5000 }: RotatingTipsProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % tips.length);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [tips.length, intervalMs]);

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={index}
        className="text-center text-xs text-slate-500"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        {tips[index]}
      </motion.p>
    </AnimatePresence>
  );
}
