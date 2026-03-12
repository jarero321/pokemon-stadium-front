'use client';

import { useState } from 'react';
import { useConnectionStore } from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import { useLobby } from '@/application/hooks';

const STORAGE_KEY = 'pokemon-stadium-nickname';

export function NicknameScreen() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = useConnectionStore((s) => s.status);
  const connectionError = useConnectionStore((s) => s.error);
  const setNickname = useConnectionStore((s) => s.setNickname);
  const { socketClient, httpClient, storage } = useGame();
  const { join } = useLobby(socketClient);

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await httpClient.post<{ nickname: string }>(
        '/api/players/register',
        { nickname: trimmed },
      );

      if (!res.success) {
        setError(res.error?.message ?? 'Registration failed');
        return;
      }

      storage.set(STORAGE_KEY, trimmed);
      setNickname(trimmed);
      join(trimmed);
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-8">
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
                  ? 'bg-yellow-500 animate-pulse'
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your nickname"
            maxLength={20}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-blue-500"
          />

          <p className="text-xs text-white/30">
            1-20 characters. Letters, numbers, spaces, hyphens, underscores.
          </p>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !input.trim() || !isConnected}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading
              ? 'Joining...'
              : !isConnected
                ? 'Waiting for connection...'
                : 'Join Battle'}
          </button>
        </form>
      </div>
    </div>
  );
}
