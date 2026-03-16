'use client';
/* eslint-disable react-hooks/refs */

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseCountdownOptions {
  seconds: number;
  onExpire: () => void;
  autoStart?: boolean;
}

export function useCountdown({
  seconds,
  onExpire,
  autoStart = false,
}: UseCountdownOptions) {
  const [remaining, setRemaining] = useState(seconds);
  const [active, setActive] = useState(autoStart);
  const onExpireRef = useRef(onExpire);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  onExpireRef.current = onExpire;

  const start = useCallback(() => {
    setRemaining(seconds);
    setActive(true);
  }, [seconds]);

  const stop = useCallback(() => {
    setActive(false);
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!active) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setActive(false);
          onExpireRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  const progress = remaining / seconds;

  return { remaining, progress, active, start, stop };
}
