'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/presentation/providers/GameProvider';
import type { PlayerStatsDTO } from '@/domain/dtos';

export function LeaderboardPanel() {
  const { httpClient } = useGame();
  const [players, setPlayers] = useState<PlayerStatsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);

      try {
        const res = await httpClient.get<PlayerStatsDTO[]>(
          '/api/leaderboard?limit=10',
        );

        if (cancelled) return;

        if (res.success && res.data) {
          setPlayers(res.data);
        } else {
          setError(res.error?.message ?? 'Failed to load leaderboard');
        }
      } catch {
        if (!cancelled) {
          setError('Could not connect to server');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [httpClient]);

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-4 text-center text-lg font-bold">Leaderboard</h3>
        <p className="animate-pulse text-center text-sm text-white/40">
          Loading...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-4 text-center text-lg font-bold">Leaderboard</h3>
        <p className="text-center text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-4 text-center text-lg font-bold">Leaderboard</h3>
        <p className="text-center text-sm text-white/40">
          No battles yet. Be the first!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h3 className="mb-4 text-center text-lg font-bold">Leaderboard</h3>
      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-[2rem_1fr_3rem_3rem_4rem] gap-2 text-xs text-white/40">
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
                  ? 'border border-yellow-500/20 bg-yellow-500/5'
                  : 'border border-white/5 bg-white/[0.02]'
              }`}
            >
              <span className="text-white/50">{medal || rank}</span>
              <span className="truncate font-medium">{player.nickname}</span>
              <span className="text-center text-green-400">{player.wins}</span>
              <span className="text-center text-red-400">{player.losses}</span>
              <span className="text-right font-mono text-white/70">
                {(player.winRate * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
