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
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#080c14]">
      <div className="flex w-full max-w-3xl flex-col gap-6 md:flex-row md:items-start">
        {/* Left: Registration */}
        <div className="flex-1">
          <div className="glass-panel rounded-2xl p-10">
            {/* Brand header */}
            <div className="mb-8 text-center">
              <h1 className="screen-title brand-gradient mb-2">
                {t('nickname.title')}
              </h1>
              <p className="screen-subtitle">{t('nickname.subtitle')}</p>
            </div>

            {/* Connection status */}
            <div className="mb-5">
              <ConnectionDot status={status} />
            </div>

            {/* Connection error */}
            {connectionError && (
              <div className="alert-banner alert-banner--error mb-5">
                {connectionError}
              </div>
            )}

            {/* Registration form */}
            {!registerResult && (
              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    placeholder={t('nickname.placeholder')}
                    maxLength={20}
                    className="glass-input"
                  />
                  <p className="mt-2 text-xs text-[#475569]">
                    {t('nickname.charRules')}
                  </p>
                </div>

                {formError && (
                  <div className="alert-banner alert-banner--error">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="battle-btn battle-btn--primary"
                >
                  {loading ? t('nickname.checking') : t('nickname.register')}
                </button>
              </form>
            )}

            {/* Registration result */}
            {registerResult && (
              <div className="space-y-5">
                {registerResult.isNewPlayer ? (
                  <div className="alert-banner alert-banner--success">
                    <p className="text-base font-bold">
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
                    <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-violet-400">
                      {t('nickname.welcomeBack', {
                        name: registerResult.player.nickname,
                      })}
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="stat-block">
                        <span className="stat-block__value text-emerald-400">
                          {registerResult.player.wins}
                        </span>
                        <span className="stat-block__label">
                          {t('nickname.wins')}
                        </span>
                      </div>
                      <div className="stat-block">
                        <span className="stat-block__value text-rose-400">
                          {registerResult.player.losses}
                        </span>
                        <span className="stat-block__label">
                          {t('nickname.losses')}
                        </span>
                      </div>
                      <div className="stat-block">
                        <span className="stat-block__value text-violet-400">
                          {(registerResult.player.winRate * 100).toFixed(0)}%
                        </span>
                        <span className="stat-block__label">
                          {t('nickname.winRate')}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-center text-xs text-[#475569]">
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
                  {isConnected
                    ? t('nickname.joinBattle')
                    : t('nickname.waitingConnection')}
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
