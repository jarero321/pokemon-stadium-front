'use client';

import { useConnectionStore, useBattleStore } from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import { useBattle } from '@/application/hooks';

export function BattleScreen() {
  const status = useConnectionStore((s) => s.status);
  const forcedSwitchPending = useBattleStore((s) => s.forcedSwitchPending);
  const setForcedSwitchPending = useBattleStore(
    (s) => s.setForcedSwitchPending,
  );
  const { socketClient } = useGame();
  const {
    myPlayer,
    opponent,
    isMyTurn,
    lastTurn,
    events,
    attack,
    switchPokemon,
  } = useBattle(socketClient);

  const myActive = myPlayer?.team?.[myPlayer.activePokemonIndex] ?? null;
  const opponentActive = opponent?.team?.[opponent.activePokemonIndex] ?? null;

  const handleForcedSwitch = (index: number) => {
    if (index !== myPlayer?.activePokemonIndex) {
      switchPokemon(index);
    }
    setForcedSwitchPending(false);
  };

  const myAliveCount = myPlayer?.team?.filter((p) => !p.defeated).length ?? 0;
  const opponentAliveCount =
    opponent?.team?.filter((p) => !p.defeated).length ?? 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <h2 className="text-2xl font-bold">Battle!</h2>

      {/* Connection warning */}
      {status !== 'connected' && (
        <div className="w-full max-w-2xl rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-center text-sm text-yellow-400">
          Connection unstable...
        </div>
      )}

      {/* Turn indicator */}
      <div className="text-sm font-semibold">
        {isMyTurn ? (
          <span className="rounded-full bg-green-500/20 px-4 py-1 text-green-400">
            Your turn — choose an action!
          </span>
        ) : (
          <span className="rounded-full bg-yellow-500/20 px-4 py-1 text-yellow-400">
            Opponent&apos;s turn — waiting...
          </span>
        )}
      </div>

      {/* Battle field */}
      <div className="grid w-full max-w-2xl grid-cols-2 gap-6">
        {/* My active pokemon */}
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-blue-400">{myPlayer?.nickname}</p>
            <span className="text-xs text-white/40">
              {myAliveCount}/{myPlayer?.team?.length ?? 0} alive
            </span>
          </div>
          {myActive ? (
            <>
              <div className="flex items-center gap-3">
                {myActive.sprite && (
                  <img
                    src={myActive.sprite}
                    alt={myActive.name}
                    className="h-16 w-16 pixelated"
                  />
                )}
                <div>
                  <p className="text-lg font-bold">{myActive.name}</p>
                  <p className="text-xs text-white/40">
                    {myActive.type.join('/')}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-white/50">
                  <span>HP</span>
                  <span>
                    {myActive.hp}/{myActive.maxHp}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full transition-all duration-500 ${
                      myActive.hp / myActive.maxHp > 0.5
                        ? 'bg-green-500'
                        : myActive.hp / myActive.maxHp > 0.2
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{
                      width: `${(myActive.hp / myActive.maxHp) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="mt-2 flex gap-2 text-xs text-white/30">
                <span>ATK:{myActive.attack}</span>
                <span>DEF:{myActive.defense}</span>
                <span>SPD:{myActive.speed}</span>
              </div>
            </>
          ) : (
            <p className="py-4 text-center text-white/40">All fainted!</p>
          )}
        </div>

        {/* Opponent active pokemon */}
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-red-400">{opponent?.nickname}</p>
            <span className="text-xs text-white/40">
              {opponentAliveCount}/{opponent?.team?.length ?? 0} alive
            </span>
          </div>
          {opponentActive ? (
            <>
              <div className="flex items-center gap-3">
                {opponentActive.sprite && (
                  <img
                    src={opponentActive.sprite}
                    alt={opponentActive.name}
                    className="h-16 w-16 pixelated"
                  />
                )}
                <div>
                  <p className="text-lg font-bold">{opponentActive.name}</p>
                  <p className="text-xs text-white/40">
                    {opponentActive.type.join('/')}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-white/50">
                  <span>HP</span>
                  <span>
                    {opponentActive.hp}/{opponentActive.maxHp}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full transition-all duration-500 ${
                      opponentActive.hp / opponentActive.maxHp > 0.5
                        ? 'bg-green-500'
                        : opponentActive.hp / opponentActive.maxHp > 0.2
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{
                      width: `${(opponentActive.hp / opponentActive.maxHp) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="mt-2 flex gap-2 text-xs text-white/30">
                <span>ATK:{opponentActive.attack}</span>
                <span>DEF:{opponentActive.defense}</span>
                <span>SPD:{opponentActive.speed}</span>
              </div>
            </>
          ) : (
            <p className="py-4 text-center text-white/40">All fainted!</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-2xl space-y-3">
        <button
          onClick={attack}
          disabled={!isMyTurn}
          className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
        >
          {isMyTurn ? 'Attack!' : 'Wait for your turn...'}
        </button>

        {/* Switch pokemon */}
        {myPlayer?.team && myPlayer.team.length > 1 && (
          <div>
            <p className="mb-2 text-sm text-white/50">Switch Pokémon:</p>
            <div className="grid grid-cols-3 gap-2">
              {myPlayer.team.map((p, i) => {
                const isActive = i === myPlayer.activePokemonIndex;
                return (
                  <button
                    key={i}
                    onClick={() => switchPokemon(i)}
                    disabled={!isMyTurn || p.defeated || isActive}
                    className={`rounded-lg border p-2 text-left text-sm transition ${
                      isActive
                        ? 'border-blue-500/50 bg-blue-500/20'
                        : p.defeated
                          ? 'border-red-500/20 bg-red-500/5 opacity-40'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                    } disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-2">
                      {p.sprite && (
                        <img
                          src={p.sprite}
                          alt={p.name}
                          className="h-6 w-6 pixelated"
                        />
                      )}
                      <div>
                        <p className="font-medium">
                          {p.name}
                          {isActive && ' (active)'}
                        </p>
                        <p className="text-xs text-white/40">
                          {p.defeated ? 'Fainted' : `${p.hp}/${p.maxHp} HP`}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Event log */}
      <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-sm font-semibold text-white/50">
          Battle Log ({events.length} events)
        </p>
        <div className="max-h-48 space-y-1 overflow-y-auto text-xs text-white/60">
          {events.length === 0 && (
            <p className="text-white/30">Battle started — make your move!</p>
          )}
          {events.map((evt, i) => (
            <div key={i} className="border-b border-white/5 py-1">
              {evt.type === 'turn_result' && (
                <span>
                  <strong>{evt.data.attacker.nickname}</strong>&apos;s{' '}
                  {evt.data.attacker.pokemon} dealt{' '}
                  <strong>{evt.data.damage}</strong> damage to{' '}
                  {evt.data.defender.pokemon}
                  {evt.data.typeMultiplier > 1 && (
                    <span className="ml-1 text-yellow-400">
                      (x{evt.data.typeMultiplier} super effective!)
                    </span>
                  )}
                  {evt.data.typeMultiplier < 1 && (
                    <span className="ml-1 text-blue-400">
                      (x{evt.data.typeMultiplier} not very effective)
                    </span>
                  )}
                  {evt.data.defeated && (
                    <span className="ml-1 text-red-400">— KO!</span>
                  )}
                </span>
              )}
              {evt.type === 'pokemon_defeated' && (
                <span className="text-red-400">
                  {evt.data.owner}&apos;s {evt.data.pokemon} was defeated!
                  {evt.data.remainingTeam > 0
                    ? ` (${evt.data.remainingTeam} remaining)`
                    : ' (no Pokémon left!)'}
                </span>
              )}
              {evt.type === 'pokemon_switch' && (
                <span className="text-blue-400">
                  {evt.data.player} switched from {evt.data.previousPokemon} to{' '}
                  {evt.data.newPokemon} ({evt.data.newPokemonHp}/
                  {evt.data.newPokemonMaxHp} HP)
                </span>
              )}
              {evt.type === 'battle_end' && (
                <span className="font-bold text-yellow-400">
                  Battle ended — {evt.data.winner} wins!
                  {evt.data.reason && ` (${evt.data.reason})`}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Last turn summary */}
      {lastTurn && (
        <div className="text-xs text-white/40">
          Turn {lastTurn.turnNumber} — {lastTurn.damage} dmg (x
          {lastTurn.typeMultiplier})
        </div>
      )}

      {/* Forced switch modal */}
      {forcedSwitchPending && myPlayer?.team && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-sm rounded-xl border border-red-500/30 bg-gray-900 p-6">
            <h3 className="mb-1 text-center text-xl font-bold text-red-400">
              Pokémon Defeated!
            </h3>
            <p className="mb-4 text-center text-sm text-white/50">
              Choose your next Pokémon
            </p>
            <div className="space-y-2">
              {myPlayer.team.map((p, i) => {
                if (p.defeated) return null;
                const isAutoSelected = i === myPlayer.activePokemonIndex;
                return (
                  <button
                    key={i}
                    onClick={() => handleForcedSwitch(i)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                      isAutoSelected
                        ? 'border-blue-500/50 bg-blue-500/15 hover:bg-blue-500/25'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {p.sprite && (
                      <img
                        src={p.sprite}
                        alt={p.name}
                        className="h-10 w-10 pixelated"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">
                        {p.name}
                        {isAutoSelected && (
                          <span className="ml-2 text-xs text-blue-400">
                            (current)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-white/40">
                        {p.type.join('/')} — {p.hp}/{p.maxHp} HP
                      </p>
                    </div>
                    <div className="text-right text-xs text-white/30">
                      <p>ATK:{p.attack}</p>
                      <p>SPD:{p.speed}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
