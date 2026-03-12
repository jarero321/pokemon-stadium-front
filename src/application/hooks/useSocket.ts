'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useConnectionStore } from '@/application/stores';
import { useLobbyStore } from '@/application/stores';
import { useBattleStore } from '@/application/stores';
import { ServerEvent } from '@/domain/events';
import type { ISocketClient } from '@/application/ports';
import type { LobbyDTO } from '@/domain/dtos';
import type {
  TurnResultDTO,
  PokemonDefeatedDTO,
  PokemonSwitchDTO,
  BattleEndDTO,
} from '@/domain/dtos';

export function useSocket(socketClient: ISocketClient) {
  const hasRegisteredRef = useRef(false);
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const setStatus = useConnectionStore((s) => s.setStatus);
  const setError = useConnectionStore((s) => s.setError);
  const setLobby = useLobbyStore((s) => s.setLobby);
  const {
    setBattleStarted,
    addTurnResult,
    addPokemonDefeated,
    addPokemonSwitch,
    setBattleEnd,
  } = useBattleStore();

  const registerListeners = useCallback(() => {
    if (hasRegisteredRef.current) return;
    hasRegisteredRef.current = true;

    socketClient.on('connect', () => {
      setStatus('connected');
    });

    socketClient.on('disconnect', () => {
      setStatus('idle');
    });

    socketClient.on(ServerEvent.LOBBY_STATUS, (data) => {
      setLobby(data as LobbyDTO);
    });

    socketClient.on(ServerEvent.BATTLE_START, (data) => {
      setLobby(data as LobbyDTO);
      setBattleStarted();
    });

    socketClient.on(ServerEvent.TURN_RESULT, (data) => {
      addTurnResult(data as TurnResultDTO);
    });

    socketClient.on(ServerEvent.POKEMON_DEFEATED, (data) => {
      addPokemonDefeated(data as PokemonDefeatedDTO);
    });

    socketClient.on(ServerEvent.POKEMON_SWITCH, (data) => {
      addPokemonSwitch(data as PokemonSwitchDTO);
    });

    socketClient.on(ServerEvent.BATTLE_END, (data) => {
      setBattleEnd(data as BattleEndDTO);
    });

    socketClient.on(ServerEvent.ERROR, (data) => {
      const message = typeof data === 'object' && data !== null && 'message' in data
        ? (data as { message: string }).message
        : String(data);
      setError(message);
    });
  }, [
    socketClient,
    setStatus,
    setError,
    setLobby,
    setBattleStarted,
    addTurnResult,
    addPokemonDefeated,
    addPokemonSwitch,
    setBattleEnd,
  ]);

  useEffect(() => {
    if (!baseUrl) return;

    setStatus('connecting');
    socketClient.connect(baseUrl);
    registerListeners();

    return () => {
      socketClient.disconnect();
      setStatus('idle');
      hasRegisteredRef.current = false;
    };
  }, [baseUrl, socketClient, setStatus, registerListeners]);

  return socketClient;
}
