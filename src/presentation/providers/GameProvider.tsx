'use client';

import { createContext, useContext, useEffect, useMemo } from 'react';
import { SocketIOClient } from '@/infrastructure/socket/SocketIOClient';
import { FetchHttpClient } from '@/infrastructure/http/FetchHttpClient';
import { LocalStorageClient } from '@/infrastructure/storage/LocalStorageClient';
import { useConnectionStore } from '@/application/stores';
import { useSocket, useViewSync } from '@/application/hooks';
import type { ISocketClient } from '@/application/ports';
import type { IHttpClient } from '@/application/ports';
import type { IStorage } from '@/application/ports';

const STORAGE_KEYS = {
  NICKNAME: 'pokemon-stadium-nickname',
  BASE_URL: 'pokemon-stadium-base-url',
};

const DEFAULT_BASE_URL = 'http://localhost:3001';

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

  useSocket(socketClient);
  useViewSync();

  const value = useMemo(
    () => ({ socketClient, httpClient, storage }),
    [socketClient, httpClient, storage],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
