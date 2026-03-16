import { create } from 'zustand';
import type {
  TurnResultDTO,
  PokemonDefeatedDTO,
  PokemonSwitchDTO,
  BattleEndDTO,
} from '@/domain/dtos';

export type BattleEvent =
  | { type: 'turn_result'; data: TurnResultDTO }
  | { type: 'pokemon_defeated'; data: PokemonDefeatedDTO }
  | { type: 'pokemon_switch'; data: PokemonSwitchDTO }
  | { type: 'battle_end'; data: BattleEndDTO };

interface BattleState {
  started: boolean;
  finished: boolean;
  winner: string | null;
  events: BattleEvent[];
  lastTurn: TurnResultDTO | null;
  lastSwitch: PokemonSwitchDTO | null;
  forcedSwitchPending: boolean;
  animating: boolean;

  setBattleStarted: () => void;
  setAnimating: (v: boolean) => void;
  addTurnResult: (turn: TurnResultDTO) => void;
  addPokemonDefeated: (
    data: PokemonDefeatedDTO,
    myNickname: string | null,
  ) => void;
  addPokemonSwitch: (data: PokemonSwitchDTO) => void;
  setBattleEnd: (data: BattleEndDTO) => void;
  setForcedSwitchPending: (pending: boolean) => void;

  reset: () => void;
}

const initialState = {
  started: false,
  finished: false,
  winner: null,
  events: [] as BattleEvent[],
  lastTurn: null,
  lastSwitch: null,
  forcedSwitchPending: false,
  animating: false,
};

export const useBattleStore = create<BattleState>((set) => ({
  ...initialState,

  setBattleStarted: () => set({ started: true }),
  setAnimating: (v) => set({ animating: v }),

  addTurnResult: (turn) =>
    set((state) => ({
      lastTurn: turn,
      events: [...state.events, { type: 'turn_result', data: turn }],
    })),

  addPokemonDefeated: (data, myNickname) =>
    set((state) => ({
      events: [...state.events, { type: 'pokemon_defeated', data }],
      forcedSwitchPending: data.owner === myNickname && data.remainingTeam > 0,
    })),

  addPokemonSwitch: (data) =>
    set((state) => ({
      lastSwitch: data,
      forcedSwitchPending: false,
      events: [...state.events, { type: 'pokemon_switch', data }],
    })),

  setBattleEnd: (data) =>
    set((state) => ({
      finished: true,
      winner: data.winner,
      forcedSwitchPending: false,
      events: [...state.events, { type: 'battle_end', data }],
    })),

  setForcedSwitchPending: (pending) => set({ forcedSwitchPending: pending }),

  reset: () => set(initialState),
}));
