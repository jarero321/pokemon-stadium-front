'use client';

import { useEffect, useRef } from 'react';
import { useConnectionStore, useLobbyStore } from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import { useLobby, useLeaveGame } from '@/application/hooks';
import { LobbyScreenView } from './LobbyScreenView';

export function LobbyScreen() {
  const status = useConnectionStore((s) => s.status);
  const connectionError = useConnectionStore((s) => s.error);
  const { socketClient, httpClient, storage } = useGame();
  const { lobby, myPlayer, opponent, nickname, assignPokemon } =
    useLobby(socketClient);
  const leaveGame = useLeaveGame(socketClient, httpClient, storage);

  const hasAutoAssigned = useRef(false);
  const resetLobby = useLobbyStore((s) => s.reset);

  const bothJoined = (lobby?.players?.length ?? 0) >= 2;
  const lobbyFinishedWithoutBattle =
    lobby?.status === 'finished' && !lobby.winner;

  // If lobby was closed without a battle (opponent left), reset to find a new match
  useEffect(() => {
    if (lobbyFinishedWithoutBattle) {
      resetLobby();
      hasAutoAssigned.current = false;
    }
  }, [lobbyFinishedWithoutBattle, resetLobby]);

  // Auto-assign Pokemon team once both players are in the lobby
  useEffect(() => {
    if (!myPlayer || !bothJoined) return;
    const hasTeam = myPlayer.team && myPlayer.team.length > 0;
    if (!hasTeam && !hasAutoAssigned.current && socketClient.isConnected()) {
      hasAutoAssigned.current = true;
      assignPokemon();
    }
  }, [myPlayer, bothJoined, socketClient, assignPokemon]);

  const handleLeave = () => {
    leaveGame();
  };

  return (
    <LobbyScreenView
      status={status}
      connectionError={connectionError}
      nickname={nickname}
      lobbyStatus={lobby?.status ?? null}
      myPlayer={myPlayer}
      opponent={opponent}
      waitingForOpponent={(lobby?.players?.length ?? 0) < 2}
      onLeave={handleLeave}
    />
  );
}
