import { create } from 'zustand';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface ConnectionState {
  baseUrl: string | null;
  status: ConnectionStatus;
  error: string | null;
  nickname: string | null;

  setBaseUrl: (url: string) => void;
  setStatus: (status: ConnectionStatus) => void;
  setError: (error: string | null) => void;
  setNickname: (nickname: string) => void;
  reset: () => void;
}

const initialState = {
  baseUrl: null,
  status: 'idle' as ConnectionStatus,
  error: null as string | null,
  nickname: null as string | null,
};

export const useConnectionStore = create<ConnectionState>((set) => ({
  ...initialState,

  setBaseUrl: (url) => set({ baseUrl: url }),
  setStatus: (status) =>
    set({ status, error: status === 'error' ? undefined : null }),
  setError: (error) => set({ error, status: 'error' }),
  setNickname: (nickname) => set({ nickname }),
  reset: () => set(initialState),
}));
