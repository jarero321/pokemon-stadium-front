'use client';

import { useConnectionStore } from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import { useLobby } from '@/application/hooks';
import { LobbyStatus } from '@/domain/enums';

export function ReadyScreen() {
  const status = useConnectionStore((s) => s.status);
  const { socketClient } = useGame();
  const { lobby, myPlayer, opponent, markReady } = useLobby(socketClient);

  const isReady = lobby?.status === LobbyStatus.READY;
  const isBothReady = myPlayer?.ready && opponent?.ready;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-white/5 p-8">
        <h2 className="mb-2 text-center text-2xl font-bold">Ready Up</h2>
        <p className="mb-6 text-center text-sm text-white/40">
          {isReady || isBothReady
            ? 'Both players ready! Starting battle...'
            : myPlayer?.ready
              ? 'Waiting for opponent to ready up...'
              : 'Review your team and ready up!'}
        </p>

        {/* Connection warning */}
        {status !== 'connected' && (
          <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-center text-sm text-yellow-400">
            Connection lost — attempting to reconnect...
          </div>
        )}

        {/* Teams side by side */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {/* My team */}
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-blue-400">
                {myPlayer?.nickname ?? 'You'}
              </p>
              {myPlayer?.ready ? (
                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                  Ready
                </span>
              ) : (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/40">
                  Not ready
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {myPlayer?.team?.map((p, i) => (
                <li
                  key={i}
                  className={`rounded border border-white/5 bg-white/5 p-2 text-sm ${
                    i === myPlayer.activePokemonIndex
                      ? 'border-blue-500/30'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {p.sprite && (
                      <img
                        src={p.sprite}
                        alt={p.name}
                        className="h-8 w-8 pixelated"
                      />
                    )}
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-white/40">
                        {p.type.join('/')} — HP:{p.hp}/{p.maxHp}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Opponent team */}
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-red-400">
                {opponent?.nickname ?? 'Opponent'}
              </p>
              {opponent?.ready ? (
                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                  Ready
                </span>
              ) : (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/40">
                  Not ready
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {opponent?.team?.map((p, i) => (
                <li
                  key={i}
                  className={`rounded border border-white/5 bg-white/5 p-2 text-sm ${
                    i === opponent.activePokemonIndex ? 'border-red-500/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {p.sprite && (
                      <img
                        src={p.sprite}
                        alt={p.name}
                        className="h-8 w-8 pixelated"
                      />
                    )}
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-white/40">
                        {p.type.join('/')} — HP:{p.hp}/{p.maxHp}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Status */}
        <div className="mb-4 text-center text-sm text-white/50">
          Lobby: {lobby?.status ?? 'unknown'}
        </div>

        {/* Ready button */}
        <button
          onClick={markReady}
          disabled={myPlayer?.ready}
          className="w-full rounded-lg bg-yellow-600 py-3 font-semibold text-white transition hover:bg-yellow-500 disabled:opacity-50"
        >
          {isBothReady
            ? 'Starting battle...'
            : myPlayer?.ready
              ? 'Waiting for opponent...'
              : "I'm Ready!"}
        </button>
      </div>
    </div>
  );
}
