import { create } from 'zustand';

interface ConnectionState {
  baseUrl: string | null;
  connected: boolean;
  nickname: string | null;

  setBaseUrl: (url: string) => void;
  setConnected: (connected: boolean) => void;
  setNickname: (nickname: string) => void;
  reset: () => void;
}

const initialState = {
  baseUrl: null,
  connected: false,
  nickname: null,
};

export const useConnectionStore = create<ConnectionState>((set) => ({
  ...initialState,

  setBaseUrl: (url) => set({ baseUrl: url }),
  setConnected: (connected) => set({ connected }),
  setNickname: (nickname) => set({ nickname }),
  reset: () => set(initialState),
}));
