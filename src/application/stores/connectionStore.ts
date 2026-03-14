import { create } from 'zustand';
import type { ServerError } from '@/domain/errors';

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

interface ConnectionState {
  baseUrl: string | null;
  status: ConnectionStatus;
  error: string | null;
  nickname: string | null;
  token: string | null;
  pendingAction: string | null;
  serverMessage: ServerError | null;

  setBaseUrl: (url: string) => void;
  setStatus: (status: ConnectionStatus) => void;
  setError: (error: string | null) => void;
  setNickname: (nickname: string) => void;
  setToken: (token: string) => void;
  clearToken: () => void;
  setPendingAction: (action: string | null) => void;
  clearPendingAction: () => void;
  setServerMessage: (msg: ServerError | null) => void;
  reset: () => void;
}

const initialState = {
  baseUrl: null as string | null,
  status: 'idle' as ConnectionStatus,
  error: null as string | null,
  nickname: null as string | null,
  token: null as string | null,
  pendingAction: null as string | null,
  serverMessage: null as ServerError | null,
};

export const useConnectionStore = create<ConnectionState>((set) => ({
  ...initialState,

  setBaseUrl: (url) => set({ baseUrl: url }),
  setStatus: (status) =>
    set({ status, error: status === 'error' ? undefined : null }),
  setError: (error) => set({ error, status: 'error' }),
  setNickname: (nickname) => set({ nickname }),
  setToken: (token) => set({ token }),
  clearToken: () => set({ token: null }),
  setPendingAction: (action) => set({ pendingAction: action }),
  clearPendingAction: () => set({ pendingAction: null }),
  setServerMessage: (msg) => set({ serverMessage: msg }),
  reset: () => set(initialState),
}));
