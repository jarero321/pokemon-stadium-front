'use client';

import { useState } from 'react';
import { useConnectionStore } from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import { useLobby } from '@/application/hooks';
import { LeaderboardPanel } from './LeaderboardPanel';
import type { RegisterResponseDTO } from '@/domain/dtos';

const STORAGE_KEY = 'pokemon-stadium-nickname';

export function NicknameScreen() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registerResult, setRegisterResult] =
    useState<RegisterResponseDTO | null>(null);

  const status = useConnectionStore((s) => s.status);
  const connectionError = useConnectionStore((s) => s.error);
  const setNickname = useConnectionStore((s) => s.setNickname);
  const { socketClient, httpClient, storage } = useGame();
  const { join } = useLobby(socketClient);

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

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

    storage.set(STORAGE_KEY, nick);
    setNickname(nick);
    join(nick);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-6 md:flex-row">
        {/* Left: Registration */}
        <div className="flex-1">
          <div className="rounded-xl border border-white/10 bg-white/5 p-8">
            <h1 className="mb-2 text-center text-3xl font-bold">
              Pokémon Stadium Lite
            </h1>
            <p className="mb-6 text-center text-sm text-white/40">
              Real-time 1v1 battle arena
            </p>

            {/* Connection status */}
            <div className="mb-4 flex items-center justify-center gap-2 text-sm">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  isConnected
                    ? 'bg-green-500'
                    : isConnecting
                      ? 'animate-pulse bg-yellow-500'
                      : status === 'error'
                        ? 'bg-red-500'
                        : 'bg-white/30'
                }`}
              />
              <span className="text-white/50">
                {isConnected && 'Connected'}
                {isConnecting && 'Connecting...'}
                {status === 'error' && 'Connection error'}
                {status === 'idle' && 'Disconnected'}
              </span>
            </div>

            {/* Connection error */}
            {connectionError && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {connectionError}
              </div>
            )}

            {/* Registration form */}
            {!registerResult && (
              <form onSubmit={handleRegister} className="space-y-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter your nickname"
                  maxLength={20}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-blue-500"
                />

                <p className="text-xs text-white/30">
                  1-20 characters. Letters, numbers, spaces, hyphens,
                  underscores.
                </p>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !input.trim() || !isConnected}
                  className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {loading
                    ? 'Checking...'
                    : !isConnected
                      ? 'Waiting for connection...'
                      : 'Register'}
                </button>
              </form>
            )}

            {/* Onboarding: Registration result */}
            {registerResult && (
              <div className="space-y-4">
                {registerResult.isNewPlayer ? (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center">
                    <p className="text-lg font-bold text-green-400">
                      Welcome, {registerResult.player.nickname}!
                    </p>
                    <p className="mt-1 text-sm text-white/50">
                      New trainer registered. Ready for your first battle?
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                    <p className="mb-3 text-center text-lg font-bold text-blue-400">
                      Welcome back, {registerResult.player.nickname}!
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xl font-bold text-green-400">
                          {registerResult.player.wins}
                        </p>
                        <p className="text-xs text-white/40">Wins</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-red-400">
                          {registerResult.player.losses}
                        </p>
                        <p className="text-xs text-white/40">Losses</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white/70">
                          {(registerResult.player.winRate * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-white/40">Win Rate</p>
                      </div>
                    </div>
                    <p className="mt-2 text-center text-xs text-white/30">
                      {registerResult.player.totalBattles} total battles
                    </p>
                  </div>
                )}

                <button
                  onClick={handleJoinBattle}
                  disabled={!isConnected}
                  className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
                >
                  Join Battle!
                </button>

                <button
                  onClick={() => {
                    setRegisterResult(null);
                    setInput('');
                  }}
                  className="w-full rounded-lg border border-white/20 bg-transparent py-2 text-sm text-white/50 transition hover:bg-white/5"
                >
                  Use different nickname
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Leaderboard */}
        <div className="w-full md:w-80">
          <LeaderboardPanel />
        </div>
      </div>
    </div>
  );
}
