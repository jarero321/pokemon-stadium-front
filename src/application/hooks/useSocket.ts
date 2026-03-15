'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  useConnectionStore,
  useLobbyStore,
  useBattleStore,
} from '@/application/stores';
import { ServerEvent } from '@/domain/events';
import { LobbyStatus } from '@/domain/enums';
import {
  classifyError,
  isSessionConflict,
  ErrorSeverity,
} from '@/domain/errors';
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
  const sessionConflictRef = useRef(false);
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const setStatus = useConnectionStore((s) => s.setStatus);
  const setError = useConnectionStore((s) => s.setError);
  const setLobby = useLobbyStore((s) => s.setLobby);

  const registerListeners = useCallback(() => {
    if (hasRegisteredRef.current) return;
    hasRegisteredRef.current = true;

    socketClient.on('connect', () => {
      setStatus('connected');
    });

    socketClient.on('disconnect', (reason: unknown) => {
      // Skip if we already handled a session conflict
      if (sessionConflictRef.current) return;

      const clientInitiated = reason === 'io client disconnect';

      // Clear any in-flight action — the server won't respond on this socket
      useConnectionStore.getState().clearPendingAction();

      if (!clientInitiated) {
        // Server-initiated (ping timeout, transport close, server restart).
        // Don't nuke credentials — allow recovery on reconnect.
        setStatus('error');
        return;
      }

      // Client-initiated (hot reload, useSocket cleanup).
      // Preserve lobby/battle state so LOBBY_STATUS can sync on reconnect.
      // Explicit cleanup (Exit, Surrender) is handled by useLeaveGame.
      setStatus('idle');
    });

    socketClient.onError((error: Error) => {
      const current = useConnectionStore.getState().status;
      if (current === 'reconnecting') return;
      setError(error.message);
    });

    socketClient.on(ServerEvent.LOBBY_STATUS, (data) => {
      useConnectionStore.getState().clearPendingAction();
      const lobby = data as LobbyDTO;
      setLobby(lobby);

      const battle = useBattleStore.getState();

      // Recover started flag if we reconnected into an active battle
      if (lobby.status === LobbyStatus.BATTLING && !battle.started) {
        useBattleStore.getState().setBattleStarted();
      }

      // Recover forcedSwitchPending from team state
      if (lobby.status === LobbyStatus.BATTLING) {
        const myNick = useLobbyStore.getState().myNickname;
        const myPlayer = lobby.players.find((p) => p.nickname === myNick);
        if (myPlayer) {
          const active = myPlayer.team[myPlayer.activePokemonIndex];
          const hasAlive = myPlayer.team.some(
            (p, i) => !p.defeated && i !== myPlayer.activePokemonIndex,
          );
          if (active?.defeated && hasAlive) {
            useBattleStore.getState().setForcedSwitchPending(true);
          }
        }
      }

      // Recover finished state if we missed BATTLE_END
      if (
        lobby.status === LobbyStatus.FINISHED &&
        lobby.winner &&
        !battle.finished
      ) {
        const loser =
          lobby.players.find((p) => p.nickname !== lobby.winner)?.nickname ??
          '';
        useBattleStore.getState().setBattleEnd({
          winner: lobby.winner,
          loser,
          reason: 'reconnect_sync',
        });
      }
    });

    socketClient.on(ServerEvent.BATTLE_START, (data) => {
      useConnectionStore.getState().clearPendingAction();
      setLobby(data as LobbyDTO);
      useBattleStore.getState().setBattleStarted();
    });

    socketClient.on(ServerEvent.TURN_RESULT, (data) => {
      useConnectionStore.getState().clearPendingAction();
      useBattleStore.getState().addTurnResult(data as TurnResultDTO);
    });

    socketClient.on(ServerEvent.POKEMON_DEFEATED, (data) => {
      const myNick = useLobbyStore.getState().myNickname;
      useBattleStore
        .getState()
        .addPokemonDefeated(data as PokemonDefeatedDTO, myNick);
    });

    socketClient.on(ServerEvent.POKEMON_SWITCH, (data) => {
      useConnectionStore.getState().clearPendingAction();
      useBattleStore.getState().addPokemonSwitch(data as PokemonSwitchDTO);
    });

    socketClient.on(ServerEvent.BATTLE_END, (data) => {
      useBattleStore.getState().setBattleEnd(data as BattleEndDTO);
    });

    socketClient.on(ServerEvent.ERROR, (data) => {
      const serverError = data as ServerError;
      const severity = classifyError(serverError.code);
      useConnectionStore.getState().clearPendingAction();

      if (isSessionConflict(serverError.code)) {
        // Nickname already has an active session — hard reset to register
        sessionConflictRef.current = true;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pokemon-stadium-nickname');
          localStorage.removeItem('pokemon-stadium-token');
          // Store error for display after redirect
          sessionStorage.setItem('pokemon-stadium-error', serverError.message);
          window.location.href = '/register';
        }
        return;
      }

      if (severity === ErrorSeverity.FATAL) {
        setError(serverError.message);
      } else {
        useConnectionStore.getState().setServerMessage(serverError);
      }
    });
  }, [socketClient, setStatus, setError, setLobby]);

  const token = useConnectionStore((s) => s.token);

  useEffect(() => {
    if (!baseUrl || !token) return;

    sessionConflictRef.current = false;
    setStatus('connecting');
    socketClient.connect(baseUrl, token);
    registerListeners();

    return () => {
      if (!sessionConflictRef.current) {
        socketClient.disconnect();
        setStatus('idle');
      }
      hasRegisteredRef.current = false;
    };
  }, [baseUrl, token, socketClient, setStatus, registerListeners]);

  return socketClient;
}
