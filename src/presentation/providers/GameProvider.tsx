'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { SocketIOClient } from '@/infrastructure/socket/SocketIOClient';
import { FetchHttpClient } from '@/infrastructure/http/FetchHttpClient';
import { LocalStorageClient } from '@/infrastructure/storage/LocalStorageClient';
import { useConnectionStore, useLobbyStore } from '@/application/stores';
import { useSocket, useNotifications } from '@/application/hooks';
import { ClientEvent } from '@/domain/events';
import { ServerUrlScreen } from '@/presentation/components/ServerUrlScreen';
import type { ISocketClient } from '@/application/ports';
import type { IHttpClient } from '@/application/ports';
import type { IStorage } from '@/application/ports';

const STORAGE_KEYS = {
  NICKNAME: 'pokemon-stadium-nickname',
  TOKEN: 'pokemon-stadium-token',
  BASE_URL: 'pokemon-stadium-base-url',
};

const IS_DEV = process.env.NODE_ENV === 'development';
const PROD_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function resolveBaseUrl(storage: IStorage): string | null {
  if (typeof window === 'undefined') return PROD_API_URL;

  const stored = storage.get(STORAGE_KEYS.BASE_URL);
  if (stored) return stored;

  // In production, use the build-time env var
  if (!IS_DEV) return PROD_API_URL;

  // In dev, require explicit URL input
  return null;
}

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

  const [baseUrl, setBaseUrlState] = useState<string | null>(() =>
    resolveBaseUrl(storage),
  );

  const setBaseUrl = useConnectionStore((s) => s.setBaseUrl);
  const setNickname = useConnectionStore((s) => s.setNickname);
  const setToken = useConnectionStore((s) => s.setToken);

  const httpClient = useMemo(
    () => new FetchHttpClient(baseUrl ?? ''),
    [baseUrl],
  );

  const handleUrlSubmit = (url: string) => {
    storage.set(STORAGE_KEYS.BASE_URL, url);
    setBaseUrlState(url);
  };

  useEffect(() => {
    if (!baseUrl) return;

    setBaseUrl(baseUrl);

    const savedNickname = storage.get(STORAGE_KEYS.NICKNAME);
    const savedToken = storage.get(STORAGE_KEYS.TOKEN);

    if (savedNickname) {
      setNickname(savedNickname);
    }

    if (savedToken) {
      setToken(savedToken);
      httpClient.setToken(savedToken);
    }
  }, [baseUrl, storage, setBaseUrl, setNickname, setToken, httpClient]);

  const status = useConnectionStore((s) => s.status);
  const nickname = useConnectionStore((s) => s.nickname);
  const lobby = useLobbyStore((s) => s.lobby);
  const setMyNickname = useLobbyStore((s) => s.setMyNickname);

  // Auto-rejoin lobby when reconnecting with a saved nickname
  useEffect(() => {
    if (status === 'connected' && nickname && !lobby) {
      setMyNickname(nickname);
      socketClient.emit(ClientEvent.JOIN_LOBBY);
    }
  }, [status, nickname, lobby, socketClient, setMyNickname]);

  useSocket(socketClient);
  useNotifications();

  const value = useMemo(
    () => ({ socketClient, httpClient, storage }),
    [socketClient, httpClient, storage],
  );

  // In dev mode, show URL input if no base URL is set
  if (!baseUrl) {
    return <ServerUrlScreen onSubmit={handleUrlSubmit} />;
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
