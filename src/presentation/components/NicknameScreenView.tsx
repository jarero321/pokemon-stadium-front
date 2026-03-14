import type { ConnectionStatus } from '@/application/stores';
import type { RegisterResponseDTO } from '@/domain/dtos';
import { useTranslation } from '@/lib/i18n';
import { ConnectionDot } from './ui/ConnectionDot';

export interface NicknameScreenViewProps {
  status: ConnectionStatus;
  connectionError: string | null;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  formError: string | null;
  registerResult: RegisterResponseDTO | null;
  onJoinBattle: () => void;
  onUseDifferent: () => void;
  leaderboardSlot?: React.ReactNode;
}

export function NicknameScreenView({
  status,
  connectionError,
  input,
  onInputChange,
  onSubmit,
  loading,
  formError,
  registerResult,
  onJoinBattle,
  onUseDifferent,
  leaderboardSlot,
}: NicknameScreenViewProps) {
  const { t } = useTranslation();
  const isConnected = status === 'connected';

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-6 md:flex-row">
        {/* Left: Registration */}
        <div className="flex-1">
          <div className="glass-panel rounded-xl p-8">
            <h1 className="screen-heading mb-2 text-center">
              {t('nickname.title')}
            </h1>
            <p className="mb-6 text-center text-sm text-white/40">
              {t('nickname.subtitle')}
            </p>

            {/* Connection status */}
            <div className="mb-4">
              <ConnectionDot status={status} />
            </div>

            {/* Connection error */}
            {connectionError && (
              <div className="alert-banner alert-banner--error mb-4">
                {connectionError}
              </div>
            )}

            {/* Registration form */}
            {!registerResult && (
              <form onSubmit={onSubmit} className="space-y-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  placeholder={t('nickname.placeholder')}
                  maxLength={20}
                  className="glass-input"
                />

                <p className="text-xs text-white/30">
                  {t('nickname.charRules')}
                </p>

                {formError && (
                  <p className="text-sm text-neon-danger">{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !input.trim() || !isConnected}
                  className="battle-btn battle-btn--primary"
                >
                  {loading
                    ? t('nickname.checking')
                    : !isConnected
                      ? t('nickname.waitingConnection')
                      : t('nickname.register')}
                </button>
              </form>
            )}

            {/* Registration result */}
            {registerResult && (
              <div className="space-y-4">
                {registerResult.isNewPlayer ? (
                  <div className="alert-banner alert-banner--success p-4">
                    <p className="text-lg font-bold">
                      {t('nickname.welcome', {
                        name: registerResult.player.nickname,
                      })}
                    </p>
                    <p className="mt-1 text-sm opacity-70">
                      {t('nickname.newTrainer')}
                    </p>
                  </div>
                ) : (
                  <div className="player-card player-card--self">
                    <p className="mb-3 text-center text-sm font-bold uppercase text-neon-player">
                      {t('nickname.welcomeBack', {
                        name: registerResult.player.nickname,
                      })}
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="stat-block">
                        <span className="stat-block__value text-neon-safe">
                          {registerResult.player.wins}
                        </span>
                        <span className="stat-block__label">
                          {t('nickname.wins')}
                        </span>
                      </div>
                      <div className="stat-block">
                        <span className="stat-block__value text-neon-danger">
                          {registerResult.player.losses}
                        </span>
                        <span className="stat-block__label">
                          {t('nickname.losses')}
                        </span>
                      </div>
                      <div className="stat-block">
                        <span className="stat-block__value">
                          {(registerResult.player.winRate * 100).toFixed(0)}%
                        </span>
                        <span className="stat-block__label">
                          {t('nickname.winRate')}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-center text-xs text-white/30">
                      {t('nickname.totalBattles', {
                        count: registerResult.player.totalBattles,
                      })}
                    </p>
                  </div>
                )}

                <button
                  onClick={onJoinBattle}
                  disabled={!isConnected}
                  className="battle-btn battle-btn--success"
                >
                  {t('nickname.joinBattle')}
                </button>

                <button onClick={onUseDifferent} className="ghost-btn">
                  {t('nickname.useDifferent')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Leaderboard */}
        {leaderboardSlot && (
          <div className="w-full md:w-80">{leaderboardSlot}</div>
        )}
      </div>
    </div>
  );
}
