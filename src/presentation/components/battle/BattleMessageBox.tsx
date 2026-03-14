'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useBattleTips } from '@/lib/i18n';

export interface BattleMessage {
  text: string;
  type?:
    | 'normal'
    | 'super-effective'
    | 'not-effective'
    | 'critical'
    | 'ko'
    | 'victory'
    | 'defeat'
    | 'info';
}

interface BattleMessageBoxProps {
  messages: BattleMessage[];
  messageKey?: number;
  typingSpeed?: number;
  onQueueComplete?: () => void;
}

const MSG_STYLES: Record<string, string> = {
  'super-effective':
    'text-amber-400 [text-shadow:0_0_10px_rgba(251,191,36,0.35)]',
  'not-effective':
    'text-blue-300 [text-shadow:0_0_10px_rgba(147,197,253,0.35)]',
  critical: 'text-orange-400 [text-shadow:0_0_10px_rgba(251,146,60,0.35)]',
  ko: 'text-red-400 [text-shadow:0_0_10px_rgba(248,113,113,0.35)]',
  victory: 'text-green-400 [text-shadow:0_0_12px_rgba(74,222,128,0.4)]',
  defeat: 'text-red-400 [text-shadow:0_0_12px_rgba(248,113,113,0.4)]',
  info: 'text-sky-300 [text-shadow:0_0_10px_rgba(125,211,252,0.35)]',
};

function IdleTips() {
  const tips = useBattleTips();
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * tips.length),
  );
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % tips.length);
        setFade(true);
      }, 300);
    }, 6000);
    return () => clearInterval(interval);
  }, [tips.length]);

  return (
    <div className="p-4 px-5 min-h-[88px] flex flex-col justify-center relative select-none">
      <p
        className={`text-[13px] font-medium text-white/30 leading-relaxed tracking-wide transition-opacity duration-300 ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
      >
        💡 {tips[index]}
      </p>
    </div>
  );
}

export function BattleMessageBox({
  messages,
  messageKey = 0,
  typingSpeed = 28,
  onQueueComplete,
}: BattleMessageBoxProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeFiredRef = useRef(false);

  const currentMessage = messages[currentIndex] as BattleMessage | undefined;
  const fullText = currentMessage?.text ?? '';
  const isLastMessage = currentIndex >= messages.length - 1;

  // Reset when messageKey changes (new queue)
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- batch reset driven by external messageKey prop */
    setCurrentIndex(0);
    setDisplayedChars(0);
    setIsTypingDone(false);
    /* eslint-enable react-hooks/set-state-in-effect */
    completeFiredRef.current = false;
  }, [messageKey]);

  // Typing effect
  useEffect(() => {
    if (!currentMessage || displayedChars >= fullText.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- marks typing complete when chars exhausted
      if (currentMessage && fullText.length > 0) setIsTypingDone(true);
      return;
    }
    timerRef.current = setTimeout(
      () => setDisplayedChars((c) => c + 1),
      typingSpeed,
    );
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displayedChars, fullText, typingSpeed, currentMessage]);

  // Auto-advance between messages
  useEffect(() => {
    if (!isTypingDone) return;
    if (isLastMessage) {
      if (!completeFiredRef.current) {
        completeFiredRef.current = true;
        onQueueComplete?.();
      }
      return;
    }
    advanceRef.current = setTimeout(() => {
      setCurrentIndex((i) => i + 1);
      setDisplayedChars(0);
      setIsTypingDone(false);
    }, 1400);
    return () => {
      if (advanceRef.current) clearTimeout(advanceRef.current);
    };
  }, [isTypingDone, isLastMessage, onQueueComplete]);

  // Click to skip typing or advance to next message
  const handleClick = useCallback(() => {
    if (!isTypingDone) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setDisplayedChars(fullText.length);
      return;
    }
    if (!isLastMessage) {
      if (advanceRef.current) clearTimeout(advanceRef.current);
      setCurrentIndex((i) => i + 1);
      setDisplayedChars(0);
      setIsTypingDone(false);
    }
  }, [isTypingDone, isLastMessage, fullText.length]);

  const typeClass = MSG_STYLES[currentMessage?.type ?? ''] ?? '';

  if (messages.length === 0) {
    return <IdleTips />;
  }

  return (
    <div
      className="p-4 px-5 min-h-[88px] flex flex-col justify-center relative cursor-pointer select-none"
      onClick={handleClick}
    >
      <p
        className={`text-[15px] font-semibold text-slate-100 leading-relaxed tracking-wide ${typeClass}`}
      >
        {fullText.slice(0, displayedChars)}
        {!isTypingDone && <span className="battle-msg-box__cursor" />}
      </p>
      {isTypingDone && !isLastMessage && (
        <span className="battle-msg-box__advance">▼</span>
      )}
    </div>
  );
}
