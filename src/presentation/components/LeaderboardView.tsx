import type { PlayerStatsDTO } from '@/domain/dtos';

interface LeaderboardViewProps {
  players: PlayerStatsDTO[];
  loading?: boolean;
  error?: string | null;
}

export function LeaderboardView({
  players,
  loading,
  error,
}: LeaderboardViewProps) {
  if (loading) {
    return (
      <div className="glass-panel rounded-xl p-6">
        <h3 className="mb-4 text-center text-sm font-bold text-gray-300">
          Leaderboard
        </h3>
        <p className="animate-pulse text-center text-sm text-white/40">
          Loading...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-xl p-6">
        <h3 className="mb-4 text-center text-sm font-bold text-gray-300">
          Leaderboard
        </h3>
        <p className="text-center text-sm text-neon-danger">{error}</p>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-6">
        <h3 className="mb-4 text-center text-sm font-bold text-gray-300">
          Leaderboard
        </h3>
        <p className="text-center text-sm text-white/40">
          No battles yet. Be the first!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-6">
      <h3 className="mb-4 text-center text-sm font-bold text-gray-300">
        Leaderboard
      </h3>
      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-[2rem_1fr_3rem_3rem_4rem] gap-2 text-[10px] font-semibold text-gray-500 uppercase">
          <span>#</span>
          <span>Player</span>
          <span className="text-center">W</span>
          <span className="text-center">L</span>
          <span className="text-right">Rate</span>
        </div>

        {/* Rows */}
        {players.map((player, i) => {
          const rank = i + 1;
          const medal =
            rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

          return (
            <div
              key={player.nickname}
              className={`grid grid-cols-[2rem_1fr_3rem_3rem_4rem] gap-2 rounded-lg px-2 py-1.5 text-sm ${
                rank <= 3
                  ? 'bg-yellow-500/5 border border-yellow-500/15 rounded-lg'
                  : 'bg-white/[0.02] border border-white/[0.04]'
              }`}
            >
              <span className="text-white/50 tabular-nums">
                {medal || rank}
              </span>
              <span className="truncate font-semibold">{player.nickname}</span>
              <span className="text-center text-neon-safe tabular-nums">
                {player.wins}
              </span>
              <span className="text-center text-neon-danger tabular-nums">
                {player.losses}
              </span>
              <span className="text-right font-mono text-white/70 tabular-nums">
                {(player.winRate * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
