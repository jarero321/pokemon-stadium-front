'use client';

import { useCallback } from 'react';
import { useLobbyStore, useConnectionStore } from '@/application/stores';
import { ClientEvent } from '@/domain/events';
import type { ISocketClient } from '@/application/ports';

export function useLobby(socketClient: ISocketClient) {
  const lobby = useLobbyStore((s) => s.lobby);
  const myPlayer = useLobbyStore((s) => s.getMyPlayer());
  const opponent = useLobbyStore((s) => s.getOpponent());
  const setMyNickname = useLobbyStore((s) => s.setMyNickname);
  const nickname = useConnectionStore((s) => s.nickname);

  const join = useCallback(
    (playerNickname: string) => {
      if (!socketClient.isConnected()) return;
      setMyNickname(playerNickname);
      socketClient.emit(ClientEvent.JOIN_LOBBY);
    },
    [socketClient, setMyNickname],
  );

  const assignPokemon = useCallback(() => {
    if (!socketClient.isConnected()) return;
    socketClient.emit(ClientEvent.ASSIGN_POKEMON);
  }, [socketClient]);

  const markReady = useCallback(() => {
    if (!socketClient.isConnected()) return;
    socketClient.emit(ClientEvent.READY);
  }, [socketClient]);

  return {
    lobby,
    myPlayer,
    opponent,
    nickname,
    join,
    assignPokemon,
    markReady,
  };
}
