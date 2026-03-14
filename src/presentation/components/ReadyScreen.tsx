'use client';

import { useConnectionStore } from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import { useLobby } from '@/application/hooks';
import { LobbyStatus } from '@/domain/enums';
import { ReadyScreenView } from './ReadyScreenView';

export function ReadyScreen() {
  const status = useConnectionStore((s) => s.status);
  const { socketClient } = useGame();
  const { lobby, myPlayer, opponent, markReady } = useLobby(socketClient);

  const isReady = lobby?.status === LobbyStatus.READY;
  const isBothReady = !!(myPlayer?.ready && opponent?.ready);

  return (
    <ReadyScreenView
      status={status}
      myPlayer={myPlayer}
      opponent={opponent}
      lobbyStatus={lobby?.status ?? null}
      isReady={isReady}
      isBothReady={isBothReady}
      onReady={markReady}
    />
  );
}
