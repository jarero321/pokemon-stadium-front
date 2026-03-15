'use client';

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface GameMessage {
  id: string;
  text: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface GameNotificationProps {
  messages: GameMessage[];
  onDismiss: (id: string) => void;
}

const TYPE_STYLES: Record<string, string> = {
  info: 'border-violet-500/20 bg-violet-500/10 text-violet-300',
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  error: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
};

export function GameNotification({
  messages,
  onDismiss,
}: GameNotificationProps) {
  return (
    <div className="pointer-events-none fixed top-4 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2">
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
    const timer = setTimeout(dismiss, message.duration ?? 3000);
    return () => clearTimeout(timer);
  }, [dismiss, message.duration]);

  const style = TYPE_STYLES[message.type ?? 'info'];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto rounded-lg border px-4 py-2 text-center text-sm font-bold backdrop-blur-md ${style}`}
    >
      {message.text}
    </motion.div>
  );
}
