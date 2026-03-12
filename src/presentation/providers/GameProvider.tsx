'use client';

import { createContext, useContext, useRef, useEffect } from 'react';
import { SocketIOClient } from '@/infrastructure/socket/SocketIOClient';
import { FetchHttpClient } from '@/infrastructure/http/FetchHttpClient';
import { LocalStorageClient } from '@/infrastructure/storage/LocalStorageClient';
import { useConnectionStore, useViewStore } from '@/application/stores';
import { useSocket } from '@/application/hooks';
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
  const socketClientRef = useRef(new SocketIOClient());
  const storageRef = useRef(new LocalStorageClient());

  const setBaseUrl = useConnectionStore((s) => s.setBaseUrl);
  const setNickname = useConnectionStore((s) => s.setNickname);
  const setView = useViewStore((s) => s.setView);

  const httpClientRef = useRef<FetchHttpClient | null>(null);

  useEffect(() => {
    const storage = storageRef.current;
    const savedUrl = storage.get(STORAGE_KEYS.BASE_URL) ?? DEFAULT_BASE_URL;
    const savedNickname = storage.get(STORAGE_KEYS.NICKNAME);

    httpClientRef.current = new FetchHttpClient(savedUrl);
    setBaseUrl(savedUrl);

    if (savedNickname) {
      setNickname(savedNickname);
      setView('lobby');
    }
  }, [setBaseUrl, setNickname, setView]);

  useSocket(socketClientRef.current);

  if (!httpClientRef.current) {
    httpClientRef.current = new FetchHttpClient(DEFAULT_BASE_URL);
  }

  return (
    <GameContext.Provider
      value={{
        socketClient: socketClientRef.current,
        httpClient: httpClientRef.current,
        storage: storageRef.current,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
