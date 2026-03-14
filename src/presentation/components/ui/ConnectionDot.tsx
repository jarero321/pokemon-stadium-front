import type { ConnectionStatus } from '@/application/stores';
import { useTranslation } from '@/lib/i18n';

interface ConnectionDotProps {
  status: ConnectionStatus;
}

export function ConnectionDot({ status }: ConnectionDotProps) {
  const { t } = useTranslation();

  return (
    <div className={`connection-dot connection-dot--${status}`}>
      <span className="connection-dot__indicator" />
      <span>{t(`connection.${status}`)}</span>
    </div>
  );
}
