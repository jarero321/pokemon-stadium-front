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
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#0a0f1e]">
      <div className="flex w-full max-w-3xl flex-col gap-6 md:flex-row md:items-start">
        {/* Left: Registration */}
        <div className="flex-1">
          <div className="glass-panel rounded-2xl p-8 sm:p-10">
            {/* Brand header */}
            <div className="mb-6 text-center">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                {t('nickname.subtitle')}
              </p>
              <h1 className="screen-title text-slate-100">
                {t('nickname.title')}
              </h1>
            </div>

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
                <div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    placeholder={t('nickname.placeholder')}
                    maxLength={20}
                    autoFocus
                    className="glass-input"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500">
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
              <div className="space-y-4">
                {registerResult.isNewPlayer ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                    <p className="text-base font-bold text-emerald-400">
                      {t('nickname.welcome', {
                        name: registerResult.player.nickname,
                      })}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {t('nickname.newTrainer')}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#243049] bg-[#0e1525] p-5">
                    <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-violet-400">
                      {t('nickname.welcomeBack', {
                        name: registerResult.player.nickname,
                      })}
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xl font-bold tabular-nums text-emerald-400">
                          {registerResult.player.wins}
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          {t('nickname.wins')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xl font-bold tabular-nums text-rose-400">
                          {registerResult.player.losses}
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          {t('nickname.losses')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xl font-bold tabular-nums text-slate-200">
                          {(registerResult.player.winRate * 100).toFixed(0)}%
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          {t('nickname.winRate')}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-center text-[11px] text-slate-500">
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
