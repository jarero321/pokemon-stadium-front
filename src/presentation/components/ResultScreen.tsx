'use client';

import {
  useBattleStore,
  useLobbyStore,
  useConnectionStore,
} from '@/application/stores';
import { useLeaveGame } from '@/application/hooks';
import { useGame } from '@/presentation/providers/GameProvider';
import { ResultScreenView } from './ResultScreenView';
import type { TeamPokemon } from './battle/VictoryOverlay';

export function ResultScreen() {
  const winner = useBattleStore((s) => s.winner);
  const events = useBattleStore((s) => s.events);
  const myPlayer = useLobbyStore((s) => s.getMyPlayer());
  const opponent = useLobbyStore((s) => s.getOpponent());
  const nickname = useConnectionStore((s) => s.nickname);
  const resetBattle = useBattleStore((s) => s.reset);
  const clearLobby = useLobbyStore((s) => s.clearLobby);
  const { socketClient, httpClient, storage } = useGame();
  const leaveGame = useLeaveGame(socketClient, httpClient, storage);

  // Derived stats
  const totalTurns = events.filter((e) => e.type === 'turn_result').length;
  const totalKOs = events.filter((e) => e.type === 'pokemon_defeated').length;
  const totalDamage = events
    .filter((e) => e.type === 'turn_result')
    .reduce(
      (sum, e) => sum + (e.type === 'turn_result' ? e.data.damage : 0),
      0,
    );

  const battleEndEvent = events.find((e) => e.type === 'battle_end');
  const reason =
    battleEndEvent?.type === 'battle_end'
      ? (battleEndEvent.data.reason ?? null)
      : null;

  // Last active pokemon (for the overlay sprite fallback)
  const lastActive = myPlayer?.team?.[myPlayer.activePokemonIndex] ?? null;

  // Map teams to simplified shape
  const myTeam: TeamPokemon[] | undefined = myPlayer?.team?.map((p) => ({
    name: p.name,
    sprite: p.sprite,
    defeated: p.defeated,
  }));

  const opponentTeam: TeamPokemon[] | undefined = opponent?.team?.map((p) => ({
    name: p.name,
    sprite: p.sprite,
    defeated: p.defeated,
  }));

  const handlePlayAgain = () => {
    resetBattle();
    clearLobby();
    // Reconnect socket if disconnected (e.g. after surrender)
    if (!socketClient.isConnected()) {
      const { baseUrl, token } = useConnectionStore.getState();
      if (baseUrl && token) {
        useConnectionStore.getState().setStatus('connecting');
        socketClient.connect(baseUrl, token);
      }
    }
  };

  const handleExit = () => {
    leaveGame();
  };

  return (
    <ResultScreenView
      winner={winner}
      nickname={nickname}
      totalTurns={totalTurns}
      totalKOs={totalKOs}
      totalDamage={totalDamage}
      reason={reason}
      lastPokemonName={lastActive?.name ?? null}
      lastPokemonSprite={lastActive?.sprite ?? null}
      lastPokemonTypes={lastActive?.type ?? null}
      onPlayAgain={handlePlayAgain}
      onExit={handleExit}
      myTeam={myTeam}
      opponentTeam={opponentTeam}
      myName={myPlayer?.nickname}
      opponentName={opponent?.nickname}
    />
  );
}
