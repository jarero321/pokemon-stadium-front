'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useConnectionStore } from '@/application/stores';
import { useLobbyStore } from '@/application/stores';
import { useBattleStore } from '@/application/stores';
import { ServerEvent } from '@/domain/events';
import { classifyError, ErrorSeverity } from '@/domain/errors';
import type { ServerError } from '@/domain/errors';
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
      const hasBaseUrl = !!useConnectionStore.getState().baseUrl;
      setStatus(hasBaseUrl ? 'reconnecting' : 'idle');
    });

    socketClient.onError((error: Error) => {
      const current = useConnectionStore.getState().status;
      if (current === 'reconnecting') return;
      setError(error.message);
    });

    socketClient.on(ServerEvent.LOBBY_STATUS, (data) => {
      useConnectionStore.getState().clearPendingAction();
      setLobby(data as LobbyDTO);
    });

    socketClient.on(ServerEvent.BATTLE_START, (data) => {
      useConnectionStore.getState().clearPendingAction();
      setLobby(data as LobbyDTO);
      setBattleStarted();
    });

    socketClient.on(ServerEvent.TURN_RESULT, (data) => {
      useConnectionStore.getState().clearPendingAction();
      addTurnResult(data as TurnResultDTO);
    });

    socketClient.on(ServerEvent.POKEMON_DEFEATED, (data) => {
      const myNick = useLobbyStore.getState().myNickname;
      addPokemonDefeated(data as PokemonDefeatedDTO, myNick);
    });

    socketClient.on(ServerEvent.POKEMON_SWITCH, (data) => {
      useConnectionStore.getState().clearPendingAction();
      addPokemonSwitch(data as PokemonSwitchDTO);
    });

    socketClient.on(ServerEvent.BATTLE_END, (data) => {
      setBattleEnd(data as BattleEndDTO);
    });

    socketClient.on(ServerEvent.ERROR, (data) => {
      const serverError = data as ServerError;
      const severity = classifyError(serverError.code);
      useConnectionStore.getState().clearPendingAction();

      if (severity === ErrorSeverity.FATAL) {
        setError(serverError.message);
      } else {
        useConnectionStore.getState().setServerMessage(serverError);
      }
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

  const token = useConnectionStore((s) => s.token);

  useEffect(() => {
    if (!baseUrl || !token) return;

    setStatus('connecting');
    socketClient.connect(baseUrl, token);
    registerListeners();

    return () => {
      socketClient.disconnect();
      setStatus('idle');
      hasRegisteredRef.current = false;
    };
  }, [baseUrl, token, socketClient, setStatus, registerListeners]);

  return socketClient;
}
