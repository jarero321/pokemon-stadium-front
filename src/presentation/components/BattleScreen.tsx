'use client';

import { useEffect } from 'react';
import { useViewStore } from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import { useBattle } from '@/application/hooks';

export function BattleScreen() {
  const setView = useViewStore((s) => s.setView);
  const { socketClient } = useGame();
  const {
    myPlayer,
    opponent,
    isMyTurn,
    finished,
    lastTurn,
    events,
    attack,
    switchPokemon,
  } = useBattle(socketClient);

  useEffect(() => {
    if (finished) {
      setView('result');
    }
  }, [finished, setView]);

  const myActive = myPlayer?.team?.find((p) => !p.defeated);
  const opponentActive = opponent?.team?.find((p) => !p.defeated);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <h2 className="text-2xl font-bold">Battle!</h2>

      <div className="text-sm font-semibold">
        {isMyTurn ? (
          <span className="text-green-400">Your turn!</span>
        ) : (
          <span className="text-yellow-400">Opponent&apos;s turn...</span>
        )}
      </div>

      {/* Battle field */}
      <div className="grid w-full max-w-2xl grid-cols-2 gap-6">
        {/* My pokemon */}
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
          <p className="text-sm text-blue-400">{myPlayer?.nickname}</p>
          <p className="text-lg font-bold">{myActive?.name ?? 'All fainted!'}</p>
          {myActive && (
            <div className="mt-2">
              <div className="mb-1 flex justify-between text-xs text-white/50">
                <span>HP</span>
                <span>{myActive.hp}/{myActive.maxHp}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${(myActive.hp / myActive.maxHp) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Opponent pokemon */}
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{opponent?.nickname}</p>
          <p className="text-lg font-bold">{opponentActive?.name ?? 'All fainted!'}</p>
          {opponentActive && (
            <div className="mt-2">
              <div className="mb-1 flex justify-between text-xs text-white/50">
                <span>HP</span>
                <span>{opponentActive.hp}/{opponentActive.maxHp}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${(opponentActive.hp / opponentActive.maxHp) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex w-full max-w-2xl gap-3">
        <button
          onClick={attack}
          disabled={!isMyTurn}
          className="flex-1 rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
        >
          Attack!
        </button>
      </div>

      {/* Switch pokemon */}
      {myPlayer?.team && myPlayer.team.length > 1 && (
        <div className="w-full max-w-2xl">
          <p className="mb-2 text-sm text-white/50">Switch Pokémon:</p>
          <div className="flex gap-2">
            {myPlayer.team.map((p, i) => (
              <button
                key={i}
                onClick={() => switchPokemon(i)}
                disabled={!isMyTurn || p.defeated || p.name === myActive?.name}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10 disabled:opacity-30"
              >
                {p.name} ({p.hp}HP)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Event log */}
      <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-sm font-semibold text-white/50">Battle Log</p>
        <div className="max-h-40 space-y-1 overflow-y-auto text-xs text-white/60">
          {events.map((evt, i) => (
            <div key={i}>
              {evt.type === 'turn_result' && (
                <span>
                  {evt.data.attacker.nickname}&apos;s {evt.data.attacker.pokemon} dealt{' '}
                  {evt.data.damage} damage to {evt.data.defender.pokemon}
                  {evt.data.typeMultiplier > 1 ? ' (super effective!)' : ''}
                </span>
              )}
              {evt.type === 'pokemon_defeated' && (
                <span className="text-red-400">
                  {evt.data.pokemon} was defeated!
                </span>
              )}
              {evt.type === 'pokemon_switch' && (
                <span className="text-blue-400">
                  {evt.data.player} switched to {evt.data.newPokemon}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Last turn info */}
      {lastTurn && (
        <div className="text-xs text-white/40">
          Turn {lastTurn.turnNumber} — {lastTurn.damage} dmg (x{lastTurn.typeMultiplier})
        </div>
      )}
    </div>
  );
}
