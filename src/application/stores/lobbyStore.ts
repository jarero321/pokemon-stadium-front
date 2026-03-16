import { create } from 'zustand';
import type { LobbyDTO, PlayerDTO } from '@/domain/dtos';
import { LobbyStatus } from '@/domain/enums';

interface LobbyState {
  lobby: LobbyDTO | null;
  myNickname: string | null;

  setLobby: (lobby: LobbyDTO) => void;
  setMyNickname: (nickname: string) => void;

  getMyPlayer: () => PlayerDTO | null;
  getOpponent: () => PlayerDTO | null;
  isMyTurn: () => boolean;

  clearLobby: () => void;
  reset: () => void;
}

const initialState = {
  lobby: null,
  myNickname: null,
};

export const useLobbyStore = create<LobbyState>((set, get) => ({
  ...initialState,

  setLobby: (lobby) => set({ lobby }),
  setMyNickname: (nickname) => set({ myNickname: nickname }),

  getMyPlayer: () => {
    const { lobby, myNickname } = get();
    if (!lobby || !myNickname) return null;
    return lobby.players.find((p) => p.nickname === myNickname) ?? null;
  },

  getOpponent: () => {
    const { lobby, myNickname } = get();
    if (!lobby || !myNickname) return null;
    return lobby.players.find((p) => p.nickname !== myNickname) ?? null;
  },

  isMyTurn: () => {
    const { lobby, myNickname } = get();
    if (!lobby || !myNickname || lobby.status !== LobbyStatus.BATTLING)
      return false;
    if (lobby.currentTurnIndex === null) return false;
    const currentPlayer = lobby.players[lobby.currentTurnIndex];
    return currentPlayer?.nickname === myNickname;
  },

  clearLobby: () => set({ lobby: null }),
  reset: () => set(initialState),
}));
