'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useLobbyStore } from '@/application/stores';
import { useBattleStore } from '@/application/stores';
import { useConnectionStore } from '@/application/stores';
import { ClientEvent } from '@/domain/events';
import type { ISocketClient } from '@/application/ports';

const ACTION_TIMEOUT_MS = 8000;

export function useBattle(socketClient: ISocketClient) {
  const isMyTurn = useLobbyStore((s) => s.isMyTurn());
  const lobby = useLobbyStore((s) => s.lobby);
  const myPlayer = useLobbyStore((s) => s.getMyPlayer());
  const opponent = useLobbyStore((s) => s.getOpponent());
  const pendingAction = useConnectionStore((s) => s.pendingAction);

  const started = useBattleStore((s) => s.started);
  const finished = useBattleStore((s) => s.finished);
  const winner = useBattleStore((s) => s.winner);
  const lastTurn = useBattleStore((s) => s.lastTurn);
  const events = useBattleStore((s) => s.events);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const startActionTimeout = useCallback((action: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (useConnectionStore.getState().pendingAction === action) {
        useConnectionStore.getState().clearPendingAction();
        toast.warning('Action timed out. Try again.');
      }
      timeoutRef.current = null;
    }, ACTION_TIMEOUT_MS);
  }, []);

  const attack = useCallback(() => {
    if (!isMyTurn || pendingAction) return;
    if (!socketClient.isConnected()) {
      toast.error('Not connected');
      return;
    }
    useConnectionStore.getState().setPendingAction('attack');
    socketClient.emit(ClientEvent.ATTACK, {
      requestId: crypto.randomUUID(),
    });
    startActionTimeout('attack');
  }, [socketClient, isMyTurn, pendingAction, startActionTimeout]);

  const switchPokemon = useCallback(
    (targetPokemonIndex: number) => {
      if (!isMyTurn || pendingAction) return;
      if (!socketClient.isConnected()) {
        toast.error('Not connected');
        return;
      }
      useConnectionStore.getState().setPendingAction('switch_pokemon');
      socketClient.emit(ClientEvent.SWITCH_POKEMON, {
        requestId: crypto.randomUUID(),
        targetPokemonIndex,
      });
      startActionTimeout('switch_pokemon');
    },
    [socketClient, isMyTurn, pendingAction, startActionTimeout],
  );

  return {
    lobby,
    myPlayer,
    opponent,
    isMyTurn,
    pendingAction,
    started,
    finished,
    winner,
    lastTurn,
    events,
    attack,
    switchPokemon,
  };
}
