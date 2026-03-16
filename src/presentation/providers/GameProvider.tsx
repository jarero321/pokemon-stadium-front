'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SocketIOClient } from '@/infrastructure/socket/SocketIOClient';
import { FetchHttpClient } from '@/infrastructure/http/FetchHttpClient';
import { LocalStorageClient } from '@/infrastructure/storage/LocalStorageClient';
import { useConnectionStore, useLobbyStore } from '@/application/stores';
import {
  useSocket,
  useGameNotifications,
  useRouteSync,
} from '@/application/hooks';
import { GameNotification } from '@/presentation/components/ui/GameNotification';
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

const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function resolveBaseUrl(storage: IStorage): string | null {
  if (typeof window === 'undefined') return DEFAULT_API_URL;

  const stored = storage.get(STORAGE_KEYS.BASE_URL);
  if (stored) return stored;

  // Per spec: "On first launch, the view must request the backend base URL"
  // Show URL input screen until user sets it — works in both dev and prod
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

  const httpClientRef = useRef(httpClient);
  useEffect(() => {
    httpClientRef.current = httpClient;
  }, [httpClient]);

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
      httpClientRef.current.setToken(savedToken);
    }
  }, [baseUrl, storage, setBaseUrl, setNickname, setToken]);

  const status = useConnectionStore((s) => s.status);
  const nickname = useConnectionStore((s) => s.nickname);
  const lobby = useLobbyStore((s) => s.lobby);
  const setMyNickname = useLobbyStore((s) => s.setMyNickname);

  // Auto-rejoin lobby when reconnecting with a saved nickname
  const joiningRef = useRef(false);

  useEffect(() => {
    if (status === 'connected' && nickname && !lobby && !joiningRef.current) {
      joiningRef.current = true;
      setMyNickname(nickname);
      socketClient.emit(ClientEvent.JOIN_LOBBY);
    }

    // Reset guard when lobby is set (join succeeded) or nickname cleared
    if (lobby || !nickname) {
      joiningRef.current = false;
    }
  }, [status, nickname, lobby, socketClient, setMyNickname]);

  useSocket(socketClient);
  const { messages: gameMessages, dismiss: dismissMessage } =
    useGameNotifications();
  useRouteSync();

  const value = useMemo(
    () => ({ socketClient, httpClient, storage }),
    [socketClient, httpClient, storage],
  );

  // In dev mode, show URL input if no base URL is set
  if (!baseUrl) {
    return <ServerUrlScreen onSubmit={handleUrlSubmit} />;
  }

  return (
    <GameContext.Provider value={value}>
      {children}
      <GameNotification messages={gameMessages} onDismiss={dismissMessage} />
    </GameContext.Provider>
  );
}
