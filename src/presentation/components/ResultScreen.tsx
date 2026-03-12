'use client';

import { useConnectionStore, useViewStore, useBattleStore, useLobbyStore } from '@/application/stores';

const STORAGE_KEY = 'pokemon-stadium-nickname';

export function ResultScreen() {
  const winner = useBattleStore((s) => s.winner);
  const nickname = useConnectionStore((s) => s.nickname);
  const setView = useViewStore((s) => s.setView);
  const resetBattle = useBattleStore((s) => s.reset);
  const resetLobby = useLobbyStore((s) => s.reset);

  const isWinner = winner === nickname;

  const handlePlayAgain = () => {
    resetBattle();
    resetLobby();
    setView('lobby');
  };

  const handleExit = () => {
    resetBattle();
    resetLobby();
    useConnectionStore.getState().reset();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setView('nickname');
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <h2 className="mb-2 text-4xl font-bold">
          {isWinner ? 'Victory!' : 'Defeat'}
        </h2>
        <p className="mb-8 text-lg text-white/60">
          {isWinner
            ? 'You are the Pokémon Champion!'
            : `${winner} wins this round.`}
        </p>

        <div className="space-y-3">
          <button
            onClick={handlePlayAgain}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Play Again
          </button>
          <button
            onClick={handleExit}
            className="w-full rounded-lg border border-white/20 bg-transparent py-3 font-semibold text-white/70 transition hover:bg-white/5"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
