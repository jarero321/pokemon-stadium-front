import type { ConnectionStatus } from '@/application/stores';
import { useTranslation } from '@/lib/i18n';

interface ConnectionDotProps {
  status: ConnectionStatus;
}

const DOT_COLORS: Record<ConnectionStatus, string> = {
  connected: 'bg-[var(--color-neon-safe)]',
  connecting:
    'bg-[var(--color-neon-warning)] animate-[dot-blink_1s_step-start_infinite]',
  reconnecting:
    'bg-[var(--color-neon-warning)] animate-[dot-blink_1s_step-start_infinite]',
  error: 'bg-[var(--color-neon-danger)]',
  idle: 'bg-[#475569]',
};

export function ConnectionDot({ status }: ConnectionDotProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
      <span
        className={`inline-block h-2 w-2 rounded-full transition-colors duration-[var(--t-normal)] ${DOT_COLORS[status] ?? 'bg-[#475569]'}`}
      />
      <span>{t(`connection.${status}`)}</span>
    </div>
  );
}
