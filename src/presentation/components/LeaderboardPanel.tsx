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
    const controller = new AbortController();

    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);

      try {
        const res = await httpClient.get<PlayerStatsDTO[]>(
          '/api/leaderboard?limit=10',
        );

        if (controller.signal.aborted) return;

        if (res.success && res.data) {
          setPlayers(res.data);
        } else {
          setError(res.error?.message ?? 'Failed to load leaderboard');
        }
      } catch {
        if (!controller.signal.aborted) {
          setError('Could not connect to server');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchLeaderboard();
    return () => controller.abort();
  }, [httpClient]);

  return <LeaderboardView players={players} loading={loading} error={error} />;
}
