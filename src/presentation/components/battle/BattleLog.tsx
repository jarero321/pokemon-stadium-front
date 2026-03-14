'use client';

interface BattleLogProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BattleLog({ title, children, className = '' }: BattleLogProps) {
  return (
    <div
      className={`rounded-[14px] p-3.5 px-4 bg-[rgba(8,8,20,0.80)] backdrop-blur-[10px] border border-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.40)] ${className}`}
    >
      {title && (
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/30 mb-2.5">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

export function BattleLogEntry({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`py-1 border-b border-white/[0.04] text-xs leading-relaxed text-white/55 ${className}`}
    >
      {children}
    </div>
  );
}
