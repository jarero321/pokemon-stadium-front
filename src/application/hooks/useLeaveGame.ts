'use client';

import { useCallback } from 'react';
import {
  useConnectionStore,
  useLobbyStore,
  useBattleStore,
} from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';

export function useLeaveGame() {
  const { socketClient, storage, httpClient } = useGame();

  const leave = useCallback(() => {
    socketClient.disconnect();
    useLobbyStore.getState().reset();
    useBattleStore.getState().reset();
    storage.remove('pokemon-stadium-nickname');
    storage.remove('pokemon-stadium-token');
    httpClient.clearToken();
    const { baseUrl } = useConnectionStore.getState();
    useConnectionStore.getState().reset();
    if (baseUrl) useConnectionStore.getState().setBaseUrl(baseUrl);
  }, [socketClient, storage, httpClient]);

  return leave;
}
