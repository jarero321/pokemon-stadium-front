import type { ConnectionStatus } from '@/application/stores';
import { useTranslation } from '@/lib/i18n';

interface ConnectionDotProps {
  status: ConnectionStatus;
}

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { dot: string; text: string; label?: string }
> = {
  connected: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-400/70',
  },
  connecting: {
    dot: 'bg-amber-400 animate-pulse',
    text: 'text-amber-400/70',
  },
  reconnecting: {
    dot: 'bg-amber-400 animate-pulse',
    text: 'text-amber-400/70',
  },
  error: {
    dot: 'bg-rose-400',
    text: 'text-rose-400/70',
  },
  idle: {
    dot: 'bg-slate-500',
    text: 'text-slate-500',
  },
};

export function ConnectionDot({ status }: ConnectionDotProps) {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status];

  // Don't render when connected — it's the default happy state
  if (status === 'connected') return null;

  return (
    <div
      className={`flex items-center justify-center gap-2 text-[11px] font-medium ${config.text}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span>{t(`connection.${status}`)}</span>
    </div>
  );
}
