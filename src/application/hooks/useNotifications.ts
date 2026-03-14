'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useConnectionStore, useLobbyStore } from '@/application/stores';
import { classifyError, ErrorSeverity } from '@/domain/errors';
import type { LobbyDTO } from '@/domain/dtos';
import { useTranslation } from '@/lib/i18n';

export function useNotifications() {
  const lobby = useLobbyStore((s) => s.lobby);
  const myNickname = useLobbyStore((s) => s.myNickname);
  const error = useConnectionStore((s) => s.error);
  const status = useConnectionStore((s) => s.status);
  const serverMessage = useConnectionStore((s) => s.serverMessage);
  const { t } = useTranslation();

  const prevLobbyRef = useRef<LobbyDTO | null>(null);
  const prevStatusRef = useRef(status);

  // Connection status changes
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    if (prev === 'connecting' && status === 'connected') {
      toast.success(t('notifications.connected'));
    }
    if (prev === 'connected' && status === 'idle') {
      toast.error(t('notifications.disconnected'));
    }
    if (status === 'reconnecting') {
      toast.loading(t('notifications.reconnecting'), { id: 'reconnect' });
    }
    if (prev === 'reconnecting' && status === 'connected') {
      toast.dismiss('reconnect');
      toast.success(t('notifications.reconnected'));
    }
  }, [status, t]);

  // Socket errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Classified server messages
  useEffect(() => {
    if (!serverMessage) return;
    const severity = classifyError(serverMessage.code);
    if (severity === ErrorSeverity.INFORMATIONAL) {
      toast.info(serverMessage.message, { duration: 3000 });
    } else {
      toast.warning(serverMessage.message, { duration: 5000 });
    }
    useConnectionStore.getState().setServerMessage(null);
  }, [serverMessage]);

  // Lobby state changes
  useEffect(() => {
    const prev = prevLobbyRef.current;
    prevLobbyRef.current = lobby;

    if (!lobby || !myNickname) return;
    if (!prev) return;

    const prevPlayerCount = prev.players.length;
    const currPlayerCount = lobby.players.length;

    // Opponent joined
    if (prevPlayerCount < 2 && currPlayerCount === 2) {
      const opponent = lobby.players.find((p) => p.nickname !== myNickname);
      if (opponent) {
        toast.success(
          t('notifications.opponentJoined', { name: opponent.nickname }),
        );
      }
    }

    // Opponent assigned team
    const prevOpponent = prev.players.find((p) => p.nickname !== myNickname);
    const currOpponent = lobby.players.find((p) => p.nickname !== myNickname);
    if (
      prevOpponent &&
      currOpponent &&
      prevOpponent.team.length === 0 &&
      currOpponent.team.length > 0
    ) {
      toast.info(
        t('notifications.opponentHasTeam', { name: currOpponent.nickname }),
      );
    }

    // Opponent ready
    if (
      prevOpponent &&
      currOpponent &&
      !prevOpponent.ready &&
      currOpponent.ready
    ) {
      toast.success(
        t('notifications.opponentReady', { name: currOpponent.nickname }),
      );
    }
  }, [lobby, myNickname, t]);
}
