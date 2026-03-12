'use client';

import { useViewStore } from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import { useLobby } from '@/application/hooks';
import { LobbyStatus } from '@/domain/enums';

export function LobbyScreen() {
  const setView = useViewStore((s) => s.setView);
  const { socketClient } = useGame();
  const { lobby, myPlayer, opponent, nickname, assignPokemon } = useLobby(socketClient);

  const hasPokemon = myPlayer?.team && myPlayer.team.length > 0;

  if (hasPokemon) {
    setView('ready');
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-white/5 p-8">
        <h2 className="mb-6 text-center text-2xl font-bold">Lobby</h2>

        <div className="mb-6 space-y-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/50">You</p>
            <p className="text-lg font-semibold">{nickname ?? '???'}</p>
            <p className="text-sm text-white/40">
              {myPlayer?.team?.length ? `${myPlayer.team.length} Pokémon` : 'No Pokémon'}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/50">Opponent</p>
            <p className="text-lg font-semibold">{opponent?.nickname ?? 'Waiting...'}</p>
            <p className="text-sm text-white/40">
              {opponent?.team?.length ? `${opponent.team.length} Pokémon` : 'No Pokémon'}
            </p>
          </div>
        </div>

        <div className="mb-4 text-center text-sm text-white/50">
          Status: {lobby?.status ?? 'unknown'}
        </div>

        <button
          onClick={assignPokemon}
          disabled={lobby?.status !== LobbyStatus.WAITING}
          className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
        >
          Assign Pokémon
        </button>
      </div>
    </div>
  );
}
