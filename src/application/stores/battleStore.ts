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

  setBattleStarted: () => void;
  addTurnResult: (turn: TurnResultDTO) => void;
  addPokemonDefeated: (data: PokemonDefeatedDTO) => void;
  addPokemonSwitch: (data: PokemonSwitchDTO) => void;
  setBattleEnd: (data: BattleEndDTO) => void;

  reset: () => void;
}

const initialState = {
  started: false,
  finished: false,
  winner: null,
  events: [] as BattleEvent[],
  lastTurn: null,
};

export const useBattleStore = create<BattleState>((set) => ({
  ...initialState,

  setBattleStarted: () => set({ started: true }),

  addTurnResult: (turn) =>
    set((state) => ({
      lastTurn: turn,
      events: [...state.events, { type: 'turn_result', data: turn }],
    })),

  addPokemonDefeated: (data) =>
    set((state) => ({
      events: [...state.events, { type: 'pokemon_defeated', data }],
    })),

  addPokemonSwitch: (data) =>
    set((state) => ({
      events: [...state.events, { type: 'pokemon_switch', data }],
    })),

  setBattleEnd: (data) =>
    set((state) => ({
      finished: true,
      winner: data.winner,
      events: [...state.events, { type: 'battle_end', data }],
    })),

  reset: () => set(initialState),
}));
