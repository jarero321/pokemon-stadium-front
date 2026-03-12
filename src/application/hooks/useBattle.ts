'use client';

import { useCallback } from 'react';
import { useLobbyStore } from '@/application/stores';
import { useBattleStore } from '@/application/stores';
import { ClientEvent } from '@/domain/events';
import type { ISocketClient } from '@/application/ports';

export function useBattle(socketClient: ISocketClient) {
  const isMyTurn = useLobbyStore((s) => s.isMyTurn());
  const lobby = useLobbyStore((s) => s.lobby);
  const myPlayer = useLobbyStore((s) => s.getMyPlayer());
  const opponent = useLobbyStore((s) => s.getOpponent());

  const started = useBattleStore((s) => s.started);
  const finished = useBattleStore((s) => s.finished);
  const winner = useBattleStore((s) => s.winner);
  const lastTurn = useBattleStore((s) => s.lastTurn);
  const events = useBattleStore((s) => s.events);

  const attack = useCallback(() => {
    if (!isMyTurn) return;
    socketClient.emit(ClientEvent.ATTACK);
  }, [socketClient, isMyTurn]);

  const switchPokemon = useCallback(
    (targetPokemonIndex: number) => {
      if (!isMyTurn) return;
      socketClient.emit(ClientEvent.SWITCH_POKEMON, { targetPokemonIndex });
    },
    [socketClient, isMyTurn],
  );

  return {
    lobby,
    myPlayer,
    opponent,
    isMyTurn,
    started,
    finished,
    winner,
    lastTurn,
    events,
    attack,
    switchPokemon,
  };
}
