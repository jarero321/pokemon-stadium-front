import { create } from 'zustand';

export type GameView = 'nickname' | 'lobby' | 'ready' | 'battle' | 'result';

interface ViewState {
  currentView: GameView;
  setView: (view: GameView) => void;
  reset: () => void;
}

export const useViewStore = create<ViewState>((set) => ({
  currentView: 'nickname',
  setView: (view) => set({ currentView: view }),
  reset: () => set({ currentView: 'nickname' }),
}));
