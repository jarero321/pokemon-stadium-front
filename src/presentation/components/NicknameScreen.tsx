'use client';

import { useState } from 'react';
import { useConnectionStore } from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import { LeaderboardPanel } from './LeaderboardPanel';
import { NicknameScreenView } from './NicknameScreenView';
import type { RegisterResponseDTO } from '@/domain/dtos';

const STORAGE_KEY = 'pokemon-stadium-nickname';
const TOKEN_KEY = 'pokemon-stadium-token';

export function NicknameScreen() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registerResult, setRegisterResult] =
    useState<RegisterResponseDTO | null>(null);

  const status = useConnectionStore((s) => s.status);
  const connectionError = useConnectionStore((s) => s.error);
  const setNickname = useConnectionStore((s) => s.setNickname);
  const setToken = useConnectionStore((s) => s.setToken);
  const { httpClient, storage } = useGame();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setRegisterResult(null);

    try {
      const res = await httpClient.post<RegisterResponseDTO>(
        '/api/players/register',
        { nickname: trimmed },
      );

      if (!res.success) {
        setError(res.error?.message ?? 'Registration failed');
        return;
      }

      if (res.data) {
        setRegisterResult(res.data);
      }
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinBattle = () => {
    if (!registerResult) return;
    const nick = registerResult.player.nickname;
    const { token } = registerResult;
    storage.set(STORAGE_KEY, nick);
    storage.set(TOKEN_KEY, token);
    setNickname(nick);
    setToken(token);
    httpClient.setToken(token);
    // Socket connects via useSocket (triggered by token change).
    // Auto-rejoin in GameProvider handles join_lobby once connected.
  };

  const handleUseDifferent = () => {
    setRegisterResult(null);
    setInput('');
  };

  return (
    <NicknameScreenView
      status={status}
      connectionError={connectionError}
      input={input}
      onInputChange={setInput}
      onSubmit={handleRegister}
      loading={loading}
      formError={error}
      registerResult={registerResult}
      onJoinBattle={handleJoinBattle}
      onUseDifferent={handleUseDifferent}
      leaderboardSlot={<LeaderboardPanel />}
    />
  );
}
