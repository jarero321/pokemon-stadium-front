'use client';

import { createContext, useContext, useEffect, useMemo } from 'react';
import { SocketIOClient } from '@/infrastructure/socket/SocketIOClient';
import { FetchHttpClient } from '@/infrastructure/http/FetchHttpClient';
import { LocalStorageClient } from '@/infrastructure/storage/LocalStorageClient';
import { useConnectionStore, useLobbyStore } from '@/application/stores';
import { useSocket, useViewSync, useNotifications } from '@/application/hooks';
import { ClientEvent } from '@/domain/events';
import type { ISocketClient } from '@/application/ports';
import type { IHttpClient } from '@/application/ports';
import type { IStorage } from '@/application/ports';

const STORAGE_KEYS = {
  NICKNAME: 'pokemon-stadium-nickname',
  BASE_URL: 'pokemon-stadium-base-url',
};

const DEFAULT_BASE_URL = 'http://localhost:8080';

interface GameContextValue {
  socketClient: ISocketClient;
  httpClient: IHttpClient;
  storage: IStorage;
}

const GameContext = createContext<GameContextValue | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const storage = useMemo(() => new LocalStorageClient(), []);
  const socketClient = useMemo(() => new SocketIOClient(), []);

  const setBaseUrl = useConnectionStore((s) => s.setBaseUrl);
  const setNickname = useConnectionStore((s) => s.setNickname);

  const baseUrl = useMemo(() => {
    if (typeof window === 'undefined') return DEFAULT_BASE_URL;
    return storage.get(STORAGE_KEYS.BASE_URL) ?? DEFAULT_BASE_URL;
  }, [storage]);

  const httpClient = useMemo(() => new FetchHttpClient(baseUrl), [baseUrl]);

  useEffect(() => {
    setBaseUrl(baseUrl);

    const savedNickname = storage.get(STORAGE_KEYS.NICKNAME);
    if (savedNickname) {
      setNickname(savedNickname);
    }
  }, [baseUrl, storage, setBaseUrl, setNickname]);

  const status = useConnectionStore((s) => s.status);
  const nickname = useConnectionStore((s) => s.nickname);
  const lobby = useLobbyStore((s) => s.lobby);
  const setMyNickname = useLobbyStore((s) => s.setMyNickname);

  // Auto-rejoin lobby when reconnecting with a saved nickname
  useEffect(() => {
    if (status === 'connected' && nickname && !lobby) {
      setMyNickname(nickname);
      socketClient.emit(ClientEvent.JOIN_LOBBY, { nickname });
    }
  }, [status, nickname, lobby, socketClient, setMyNickname]);

  useSocket(socketClient);
  useViewSync();
  useNotifications();

  const value = useMemo(
    () => ({ socketClient, httpClient, storage }),
    [socketClient, httpClient, storage],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
