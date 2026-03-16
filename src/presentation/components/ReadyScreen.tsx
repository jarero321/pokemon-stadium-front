'use client';

import { useCallback } from 'react';
import { useConnectionStore } from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import { useLobby, useCountdown, useLeaveGame } from '@/application/hooks';
import { LobbyStatus } from '@/domain/enums';
import { ReadyScreenView } from './ReadyScreenView';
import { READY_TIMEOUT_SECONDS } from '@/domain/constants';

export function ReadyScreen() {
  const status = useConnectionStore((s) => s.status);
  const { socketClient, httpClient, storage } = useGame();
  const { lobby, myPlayer, opponent, markReady } = useLobby(socketClient);
  const leaveGame = useLeaveGame(socketClient, httpClient, storage);

  const isReady = lobby?.status === LobbyStatus.READY;
  const isBothReady = !!(myPlayer?.ready && opponent?.ready);

  const handleAbandon = useCallback(() => {
    // Timeout expired — leave lobby
    leaveGame();
  }, [leaveGame]);

  const countdown = useCountdown({
    seconds: READY_TIMEOUT_SECONDS,
    onExpire: handleAbandon,
    autoStart: true,
  });

  // Stop countdown when player clicks ready
  const handleReady = useCallback(() => {
    countdown.stop();
    markReady();
  }, [countdown, markReady]);

  return (
    <ReadyScreenView
      status={status}
      myPlayer={myPlayer}
      opponent={opponent}
      lobbyStatus={lobby?.status ?? null}
      isReady={isReady}
      isBothReady={isBothReady}
      onReady={handleReady}
      countdown={myPlayer?.ready ? null : countdown}
    />
  );
}
