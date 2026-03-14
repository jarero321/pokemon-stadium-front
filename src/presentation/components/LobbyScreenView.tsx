import type { ConnectionStatus } from '@/application/stores';
import type { PlayerDTO } from '@/domain/dtos';
import { useTranslation } from '@/lib/i18n';
import { ConnectionDot } from './ui/ConnectionDot';

export interface LobbyScreenViewProps {
  status: ConnectionStatus;
  connectionError: string | null;
  nickname: string | null;
  lobbyStatus: string | null;
  myPlayer: PlayerDTO | null;
  opponent: PlayerDTO | null;
  waitingForOpponent: boolean;
  assigning: boolean;
  onAssign: () => void;
}

export function LobbyScreenView({
  status,
  connectionError,
  nickname,
  lobbyStatus,
  myPlayer,
  opponent,
  waitingForOpponent,
  assigning,
  onAssign,
}: LobbyScreenViewProps) {
  const { t } = useTranslation();
  const opponentHasTeam = opponent?.team && opponent.team.length > 0;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg glass-panel rounded-xl p-8">
        <h2 className="screen-heading mb-2 text-center">{t('lobby.title')}</h2>
        <p className="mb-6 text-center text-sm text-white/40">
          {waitingForOpponent
            ? t('lobby.waitingForOpponent')
            : t('lobby.bothInLobby')}
        </p>

        {/* Connection indicator */}
        {status !== 'connected' && (
          <div className="mb-4">
            {status === 'error' && connectionError ? (
              <div className="alert-banner alert-banner--error">
                {connectionError}
              </div>
            ) : (
              <ConnectionDot status={status} />
            )}
          </div>
        )}

        {/* Players */}
        <div className="mb-6 space-y-3">
          {/* My player */}
          <div className="player-card player-card--self">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-neon-player">
                  {t('common.you')}
                </p>
                <p className="text-lg font-semibold">{nickname ?? '???'}</p>
              </div>
              <span className="neon-badge neon-badge--player">
                {myPlayer?.team?.length
                  ? t('lobby.nPokemon', { count: myPlayer.team.length })
                  : t('lobby.noTeam')}
              </span>
            </div>
          </div>

          {/* Opponent */}
          <div className="player-card player-card--opponent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white/40">
                  {t('common.opponent')}
                </p>
                <p className="text-lg font-semibold">
                  {waitingForOpponent ? (
                    <span className="animate-pulse text-white/30">
                      {t('common.loading')}
                    </span>
                  ) : (
                    opponent?.nickname
                  )}
                </p>
              </div>
              {!waitingForOpponent && (
                <span className="neon-badge neon-badge--neutral">
                  {opponentHasTeam
                    ? t('lobby.nPokemon', { count: opponent!.team.length })
                    : t('lobby.noTeam')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mb-4 text-center text-xs text-gray-500">
          {lobbyStatus ?? t('common.loading')}
        </div>

        {/* Assign button */}
        <button
          onClick={onAssign}
          disabled={assigning || waitingForOpponent}
          className="battle-btn battle-btn--success"
        >
          {assigning
            ? t('lobby.assigning')
            : waitingForOpponent
              ? t('lobby.needPlayers')
              : t('lobby.assignTeam')}
        </button>

        {waitingForOpponent && (
          <p className="mt-3 text-center text-xs text-white/30">
            {t('lobby.shareUrl')}
          </p>
        )}
      </div>
    </div>
  );
}
