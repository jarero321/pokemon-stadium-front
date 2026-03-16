'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useConnectionStore, useLobbyStore } from '@/application/stores';
import { classifyError, ErrorSeverity } from '@/domain/errors';
import { useTranslation } from '@/lib/i18n';
import type { GameMessage } from '@/presentation/components/ui/GameNotification';
import type { LobbyDTO } from '@/domain/dtos';

export function useGameNotifications() {
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const { t } = useTranslation();

  const lobby = useLobbyStore((s) => s.lobby);
  const myNickname = useLobbyStore((s) => s.myNickname);
  const status = useConnectionStore((s) => s.status);
  const serverMessage = useConnectionStore((s) => s.serverMessage);

  const prevLobbyRef = useRef<LobbyDTO | null>(null);
  const prevStatusRef = useRef(status);

  const push = useCallback(
    (text: string, type: GameMessage['type'] = 'info', duration?: number) => {
      const id = crypto.randomUUID();
      setMessages((prev) => [...prev.slice(-4), { id, text, type, duration }]);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Connection changes
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    if (prev === 'connecting' && status === 'connected') {
      queueMicrotask(() => push(t('notifications.connected'), 'success'));
    }
  }, [status, t, push]);

  // Server messages
  useEffect(() => {
    if (!serverMessage) return;
    const severity = classifyError(serverMessage.code);
    queueMicrotask(() =>
      push(
        serverMessage.message,
        severity === ErrorSeverity.INFORMATIONAL ? 'info' : 'warning',
      ),
    );
    useConnectionStore.getState().setServerMessage(null);
  }, [serverMessage, push]);

  // Lobby changes
  useEffect(() => {
    const prev = prevLobbyRef.current;
    prevLobbyRef.current = lobby;
    if (!lobby || !myNickname || !prev) return;

    const prevCount = prev.players.length;
    const currCount = lobby.players.length;

    if (prevCount < 2 && currCount === 2) {
      const opp = lobby.players.find((p) => p.nickname !== myNickname);
      if (opp)
        queueMicrotask(() =>
          push(
            t('notifications.opponentJoined', { name: opp.nickname }),
            'success',
          ),
        );
    }

    const prevOpp = prev.players.find((p) => p.nickname !== myNickname);
    const currOpp = lobby.players.find((p) => p.nickname !== myNickname);
    if (prevOpp && currOpp && !prevOpp.ready && currOpp.ready) {
      queueMicrotask(() =>
        push(
          t('notifications.opponentReady', { name: currOpp.nickname }),
          'success',
        ),
      );
    }
  }, [lobby, myNickname, t, push]);

  return { messages, dismiss };
}
