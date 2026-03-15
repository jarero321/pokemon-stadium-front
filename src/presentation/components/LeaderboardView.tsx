import type { PlayerStatsDTO } from '@/domain/dtos';

interface LeaderboardViewProps {
  players: PlayerStatsDTO[];
  loading?: boolean;
  error?: string | null;
}

function winRateColor(rate: number): string {
  if (rate >= 0.7) return 'text-emerald-400';
  if (rate >= 0.4) return 'text-amber-400';
  return 'text-rose-400';
}

const RANK_ACCENT: Record<number, string> = {
  1: 'border-l-[3px] border-l-amber-400/70 bg-amber-500/[0.04]',
  2: 'border-l-[3px] border-l-[#94a3b8]/60 bg-[#94a3b8]/[0.03]',
  3: 'border-l-[3px] border-l-amber-700/50 bg-amber-900/[0.04]',
};

const RANK_LABEL: Record<number, string> = {
  1: '1st',
  2: '2nd',
  3: '3rd',
};

export function LeaderboardView({
  players,
  loading,
  error,
}: LeaderboardViewProps) {
  const header = (
    <div className="mb-5 flex items-center gap-2">
      <span className="text-amber-400 text-base leading-none">&#9876;</span>
      <h3 className="text-sm font-bold uppercase tracking-widest text-[#e2e8f0]">
        Leaderboard
      </h3>
    </div>
  );

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        {header}
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg bg-white/[0.03]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        {header}
        <div className="alert-banner alert-banner--error">{error}</div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        {header}
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#1e2940] bg-[#0f1420] text-2xl">
            &#9876;
          </div>
          <p className="text-center text-sm text-[#475569]">
            No battles recorded yet.
          </p>
          <p className="text-center text-xs text-[#475569]/60">
            Be the first trainer to compete.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6">
      {header}

      {/* Column headers */}
      <div className="mb-2 grid grid-cols-[1.5rem_1fr_2.5rem_2.5rem_3.5rem] gap-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#475569]">
        <span>#</span>
        <span>Player</span>
        <span className="text-center">W</span>
        <span className="text-center">L</span>
        <span className="text-right">Rate</span>
      </div>

      <div className="space-y-1.5">
        {players.map((player, i) => {
          const rank = i + 1;
          const accentClass =
            RANK_ACCENT[rank] ?? 'border-l-[3px] border-l-transparent';
          const rankLabel = RANK_LABEL[rank] ?? String(rank);

          return (
            <div
              key={player.nickname}
              className={`grid grid-cols-[1.5rem_1fr_2.5rem_2.5rem_3.5rem] gap-2 rounded-lg border border-[#1e2940] px-2 py-2 text-sm transition-colors hover:bg-white/[0.03] ${accentClass}`}
            >
              <span className="text-xs font-bold tabular-nums text-[#475569] self-center">
                {rankLabel}
              </span>
              <span className="self-center truncate font-semibold text-[#e2e8f0]">
                {player.nickname}
              </span>
              <span className="self-center text-center font-mono tabular-nums text-emerald-400">
                {player.wins}
              </span>
              <span className="self-center text-center font-mono tabular-nums text-rose-400">
                {player.losses}
              </span>
              <span
                className={`self-center text-right font-mono text-xs font-bold tabular-nums ${winRateColor(player.winRate)}`}
              >
                {(player.winRate * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
