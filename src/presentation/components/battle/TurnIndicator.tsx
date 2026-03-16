interface TurnIndicatorProps {
  isMyTurn: boolean;
  children: React.ReactNode;
}

export function TurnIndicator({ isMyTurn, children }: TurnIndicatorProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 py-1.5 px-4 rounded-full text-xs font-bold tracking-wide backdrop-blur-[8px] border transition-all duration-300 ${
        isMyTurn
          ? 'bg-violet-500/10 border-violet-500/20 text-violet-400 shadow-[0_0_16px_rgba(139,92,246,0.18)] animate-[turn-pulse-green_2s_ease-in-out_infinite]'
          : 'bg-[#111827] border-[#243049] text-slate-500'
      }`}
    >
      <span
        className={`block w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor] ${
          isMyTurn ? 'animate-[dot-blink_1s_step-start_infinite]' : ''
        }`}
      />
      {children}
    </div>
  );
}
