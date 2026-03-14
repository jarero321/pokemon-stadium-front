'use client';

import { useState } from 'react';
import { useConnectionStore } from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import { useLobby } from '@/application/hooks';
import { LobbyScreenView } from './LobbyScreenView';

export function LobbyScreen() {
  const [assigning, setAssigning] = useState(false);
  const status = useConnectionStore((s) => s.status);
  const connectionError = useConnectionStore((s) => s.error);
  const { socketClient } = useGame();
  const { lobby, myPlayer, opponent, nickname, assignPokemon } =
    useLobby(socketClient);

  const handleAssign = () => {
    setAssigning(true);
    assignPokemon();
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
      assigning={assigning}
      onAssign={handleAssign}
    />
  );
}
