'use client';

import { useState } from 'react';
import { useConnectionStore } from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import { useTranslation } from '@/lib/i18n';
import { LeaderboardPanel } from './LeaderboardPanel';
import { NicknameScreenView } from './NicknameScreenView';
import type { RegisterResponseDTO } from '@/domain/dtos';

const STORAGE_KEY = 'pokemon-stadium-nickname';
const TOKEN_KEY = 'pokemon-stadium-token';

export function NicknameScreen() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem('pokemon-stadium-error');
    if (stored) sessionStorage.removeItem('pokemon-stadium-error');
    return stored;
  });
  const [registerResult, setRegisterResult] =
    useState<RegisterResponseDTO | null>(null);

  const status = useConnectionStore((s) => s.status);
  const connectionError = useConnectionStore((s) => s.error);
  const baseUrl = useConnectionStore((s) => s.baseUrl);
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
        setError(res.error?.message ?? t('leaderboard.registrationFailed'));
        return;
      }

      if (res.data) {
        setRegisterResult(res.data);
        // Clear any previous session before setting new token
        storage.remove(STORAGE_KEY);
        storage.remove(TOKEN_KEY);
        useConnectionStore.getState().reset();
        if (baseUrl) useConnectionStore.getState().setBaseUrl(baseUrl);
        // Connect socket with new token
        setToken(res.data.token);
        httpClient.setToken(res.data.token);
      }
    } catch {
      setError(t('leaderboard.noConnection'));
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
    storage.set('pokemon-stadium-token-ts', String(Date.now()));
    setNickname(nick);
    // Token already set during registration (handleRegister).
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
