'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/presentation/providers/GameProvider';
import { LeaderboardView } from './LeaderboardView';
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

  return <LeaderboardView players={players} loading={loading} error={error} />;
}
