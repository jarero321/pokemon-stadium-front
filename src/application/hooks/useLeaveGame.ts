'use client';

import { useCallback } from 'react';
import {
  useConnectionStore,
  useLobbyStore,
  useBattleStore,
} from '@/application/stores';
import type { ISocketClient, IHttpClient, IStorage } from '@/application/ports';

export function useLeaveGame(
  socketClient: ISocketClient,
  httpClient: IHttpClient,
  storage: IStorage,
) {
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
