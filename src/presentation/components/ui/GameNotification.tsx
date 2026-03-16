'use client';

import { useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { GameMessage } from '@/domain/dtos';

export type { GameMessage } from '@/domain/dtos';

interface GameNotificationProps {
  messages: GameMessage[];
  onDismiss: (id: string) => void;
}

const TYPE_STYLES: Record<string, string> = {
  info: 'border-slate-600/40 bg-slate-800/90 text-slate-300',
  success: 'border-emerald-500/30 bg-slate-800/90 text-emerald-300',
  warning: 'border-amber-500/30 bg-slate-800/90 text-amber-300',
  error: 'border-rose-500/30 bg-slate-800/90 text-rose-300',
};

export function GameNotification({
  messages,
  onDismiss,
}: GameNotificationProps) {
  return (
    <div className="pointer-events-none fixed top-3 left-1/2 z-50 flex w-full max-w-xs -translate-x-1/2 flex-col items-center gap-1.5">
      <AnimatePresence>
        {messages.map((msg) => (
          <GameNotificationItem
            key={msg.id}
            message={msg}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function GameNotificationItem({
  message,
  onDismiss,
}: {
  message: GameMessage;
  onDismiss: (id: string) => void;
}) {
  const dismiss = useCallback(
    () => onDismiss(message.id),
    [message.id, onDismiss],
  );

  useEffect(() => {
    const timer = setTimeout(dismiss, message.duration ?? 2500);
    return () => clearTimeout(timer);
  }, [dismiss, message.duration]);

  const style = TYPE_STYLES[message.type ?? 'info'];

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className={`pointer-events-auto rounded-md border px-3 py-1.5 text-center text-xs font-medium backdrop-blur-sm ${style}`}
    >
      {message.text}
    </motion.div>
  );
}
