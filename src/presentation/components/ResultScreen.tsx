'use client';

import {
  useConnectionStore,
  useViewStore,
  useBattleStore,
  useLobbyStore,
} from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import { useLobby } from '@/application/hooks';

const STORAGE_KEY = 'pokemon-stadium-nickname';

export function ResultScreen() {
  const winner = useBattleStore((s) => s.winner);
  const events = useBattleStore((s) => s.events);
  const nickname = useConnectionStore((s) => s.nickname);
  const setView = useViewStore((s) => s.setView);
  const resetBattle = useBattleStore((s) => s.reset);
  const resetLobby = useLobbyStore((s) => s.reset);
  const { socketClient, storage } = useGame();
  const { join } = useLobby(socketClient);

  const isWinner = winner === nickname;

  const battleEndEvent = events.find((e) => e.type === 'battle_end');
  const reason =
    battleEndEvent?.type === 'battle_end' ? battleEndEvent.data.reason : null;
  const isDisconnect = reason === 'opponent_disconnected';

  const totalTurns = events.filter((e) => e.type === 'turn_result').length;
  const totalKOs = events.filter((e) => e.type === 'pokemon_defeated').length;

  const handlePlayAgain = () => {
    resetBattle();
    resetLobby();
    if (nickname) {
      join(nickname);
    }
  };

  const handleExit = () => {
    resetBattle();
    resetLobby();
    useConnectionStore.getState().reset();
    storage.remove(STORAGE_KEY);
    setView('nickname');
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        {/* Result header */}
        <div
          className={`mb-2 text-5xl font-bold ${isWinner ? 'text-yellow-400' : 'text-red-400'}`}
        >
          {isWinner ? 'Victory!' : 'Defeat'}
        </div>

        {/* Sub-message */}
        <p className="mb-2 text-lg text-white/60">
          {isDisconnect
            ? 'Opponent disconnected.'
            : isWinner
              ? 'You are the Pokémon Champion!'
              : `${winner} wins this round.`}
        </p>

        {/* Disconnect notice */}
        {isDisconnect && (
          <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2 text-sm text-yellow-400">
            Battle ended due to opponent disconnection
          </div>
        )}

        {/* Battle stats */}
        <div className="mb-6 flex justify-center gap-6 text-sm text-white/40">
          <div>
            <p className="text-lg font-bold text-white/70">{totalTurns}</p>
            <p>Turns</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white/70">{totalKOs}</p>
            <p>KOs</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white/70">{events.length}</p>
            <p>Events</p>
          </div>
        </div>

        {/* Actions */}
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
