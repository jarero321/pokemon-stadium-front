'use client';

import { useEffect } from 'react';
import { useViewStore, useBattleStore } from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import { useLobby } from '@/application/hooks';

export function ReadyScreen() {
  const setView = useViewStore((s) => s.setView);
  const started = useBattleStore((s) => s.started);
  const { socketClient } = useGame();
  const { lobby, myPlayer, opponent, markReady } = useLobby(socketClient);

  useEffect(() => {
    if (started) {
      setView('battle');
    }
  }, [started, setView]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-white/5 p-8">
        <h2 className="mb-6 text-center text-2xl font-bold">Ready Up</h2>

        <div className="mb-6 grid grid-cols-2 gap-4">
          {/* My team */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-sm font-semibold text-blue-400">
              {myPlayer?.nickname ?? 'You'}
              {myPlayer?.ready && ' ✓'}
            </p>
            <ul className="space-y-1 text-sm">
              {myPlayer?.team?.map((p, i) => (
                <li key={i} className="text-white/70">
                  {p.name} ({p.hp}/{p.maxHp} HP)
                </li>
              ))}
            </ul>
          </div>

          {/* Opponent team */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-sm font-semibold text-red-400">
              {opponent?.nickname ?? 'Opponent'}
              {opponent?.ready && ' ✓'}
            </p>
            <ul className="space-y-1 text-sm">
              {opponent?.team?.map((p, i) => (
                <li key={i} className="text-white/70">
                  {p.name} ({p.hp}/{p.maxHp} HP)
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-4 text-center text-sm text-white/50">
          Status: {lobby?.status ?? 'unknown'}
        </div>

        <button
          onClick={markReady}
          disabled={myPlayer?.ready}
          className="w-full rounded-lg bg-yellow-600 py-3 font-semibold text-white transition hover:bg-yellow-500 disabled:opacity-50"
        >
          {myPlayer?.ready ? 'Waiting for opponent...' : "I'm Ready!"}
        </button>
      </div>
    </div>
  );
}
