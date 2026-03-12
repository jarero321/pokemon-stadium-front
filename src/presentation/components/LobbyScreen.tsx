'use client';

import { useState } from 'react';
import { useConnectionStore } from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import { useLobby } from '@/application/hooks';

export function LobbyScreen() {
  const [assigning, setAssigning] = useState(false);
  const status = useConnectionStore((s) => s.status);
  const connectionError = useConnectionStore((s) => s.error);
  const { socketClient } = useGame();
  const { lobby, myPlayer, opponent, nickname, assignPokemon } =
    useLobby(socketClient);

  const playerCount = lobby?.players?.length ?? 0;
  const waitingForOpponent = playerCount < 2;
  const opponentHasTeam = opponent?.team && opponent.team.length > 0;

  const handleAssign = () => {
    setAssigning(true);
    assignPokemon();
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-white/5 p-8">
        <h2 className="mb-2 text-center text-2xl font-bold">Lobby</h2>
        <p className="mb-6 text-center text-sm text-white/40">
          {waitingForOpponent
            ? 'Waiting for another player to join...'
            : 'Both players in lobby!'}
        </p>

        {/* Connection indicator */}
        {status !== 'connected' && (
          <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-center text-sm text-yellow-400">
            {status === 'connecting' && 'Reconnecting...'}
            {status === 'error' && (connectionError ?? 'Connection lost')}
            {status === 'idle' && 'Disconnected'}
          </div>
        )}

        {/* Players */}
        <div className="mb-6 space-y-3">
          {/* My player */}
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-400">You</p>
                <p className="text-lg font-semibold">{nickname ?? '???'}</p>
              </div>
              <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-400">
                {myPlayer?.team?.length
                  ? `${myPlayer.team.length} Pokémon`
                  : 'No team'}
              </span>
            </div>
          </div>

          {/* Opponent */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Opponent</p>
                <p className="text-lg font-semibold">
                  {waitingForOpponent ? (
                    <span className="animate-pulse text-white/30">
                      Waiting...
                    </span>
                  ) : (
                    opponent?.nickname
                  )}
                </p>
              </div>
              {!waitingForOpponent && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/50">
                  {opponentHasTeam
                    ? `${opponent!.team.length} Pokémon`
                    : 'No team'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mb-4 text-center text-sm text-white/50">
          Lobby: {lobby?.status ?? 'loading...'}
        </div>

        {/* Assign button */}
        <button
          onClick={handleAssign}
          disabled={assigning || waitingForOpponent}
          className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
        >
          {assigning
            ? 'Assigning team...'
            : waitingForOpponent
              ? 'Need 2 players to start'
              : 'Assign Pokémon Team'}
        </button>

        {waitingForOpponent && (
          <p className="mt-3 text-center text-xs text-white/30">
            Share the server URL with a friend to join!
          </p>
        )}
      </div>
    </div>
  );
}
