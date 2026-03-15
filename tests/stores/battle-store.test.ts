import { describe, it, expect, beforeEach } from 'vitest';
import { useBattleStore } from '@/application/stores';
import type {
  TurnResultDTO,
  PokemonDefeatedDTO,
  PokemonSwitchDTO,
  BattleEndDTO,
} from '@/domain/dtos';

function makeTurnResult(overrides: Partial<TurnResultDTO> = {}): TurnResultDTO {
  return {
    turnNumber: 1,
    attacker: { nickname: 'Ash', pokemon: 'Pikachu', attack: 55 },
    defender: {
      nickname: 'Gary',
      pokemon: 'Eevee',
      defense: 50,
      remainingHp: 45,
      maxHp: 100,
    },
    damage: 20,
    typeMultiplier: 1,
    defeated: false,
    nextPokemon: null,
    timestamp: '2026-03-15T00:00:00Z',
    ...overrides,
  };
}

function makePokemonDefeated(
  overrides: Partial<PokemonDefeatedDTO> = {},
): PokemonDefeatedDTO {
  return {
    owner: 'Gary',
    pokemon: 'Eevee',
    defeatedBy: 'Pikachu',
    remainingTeam: 2,
    ...overrides,
  };
}

function makePokemonSwitch(
  overrides: Partial<PokemonSwitchDTO> = {},
): PokemonSwitchDTO {
  return {
    player: 'Gary',
    previousPokemon: 'Eevee',
    newPokemon: 'Vaporeon',
    newPokemonHp: 100,
    newPokemonMaxHp: 100,
    ...overrides,
  };
}

function makeBattleEnd(overrides: Partial<BattleEndDTO> = {}): BattleEndDTO {
  return {
    winner: 'Ash',
    loser: 'Gary',
    ...overrides,
  };
}

describe('battleStore', () => {
  beforeEach(() => {
    useBattleStore.getState().reset();
  });

  it('should have correct initial state', () => {
    const state = useBattleStore.getState();
    expect(state.started).toBe(false);
    expect(state.finished).toBe(false);
    expect(state.winner).toBeNull();
    expect(state.events).toEqual([]);
    expect(state.lastTurn).toBeNull();
    expect(state.lastSwitch).toBeNull();
    expect(state.forcedSwitchPending).toBe(false);
    expect(state.animating).toBe(false);
  });

  it('should set started to true via setBattleStarted', () => {
    useBattleStore.getState().setBattleStarted();

    expect(useBattleStore.getState().started).toBe(true);
  });

  it('should toggle animating via setAnimating', () => {
    useBattleStore.getState().setAnimating(true);
    expect(useBattleStore.getState().animating).toBe(true);

    useBattleStore.getState().setAnimating(false);
    expect(useBattleStore.getState().animating).toBe(false);
  });

  describe('addTurnResult', () => {
    it('should store lastTurn and append event', () => {
      const turn = makeTurnResult();
      useBattleStore.getState().addTurnResult(turn);

      const state = useBattleStore.getState();
      expect(state.lastTurn).toEqual(turn);
      expect(state.events).toHaveLength(1);
      expect(state.events[0]).toEqual({ type: 'turn_result', data: turn });
    });

    it('should append multiple turns correctly', () => {
      const turn1 = makeTurnResult({ turnNumber: 1 });
      const turn2 = makeTurnResult({ turnNumber: 2 });

      useBattleStore.getState().addTurnResult(turn1);
      useBattleStore.getState().addTurnResult(turn2);

      const state = useBattleStore.getState();
      expect(state.lastTurn).toEqual(turn2);
      expect(state.events).toHaveLength(2);
      expect(state.events[0]).toEqual({ type: 'turn_result', data: turn1 });
      expect(state.events[1]).toEqual({ type: 'turn_result', data: turn2 });
    });
  });

  describe('addPokemonDefeated', () => {
    it('should append event and set forcedSwitchPending when owner is myNickname and remainingTeam > 0', () => {
      const defeated = makePokemonDefeated({
        owner: 'Ash',
        remainingTeam: 2,
      });

      useBattleStore.getState().addPokemonDefeated(defeated, 'Ash');

      const state = useBattleStore.getState();
      expect(state.events).toHaveLength(1);
      expect(state.events[0]).toEqual({
        type: 'pokemon_defeated',
        data: defeated,
      });
      expect(state.forcedSwitchPending).toBe(true);
    });

    it('should NOT set forcedSwitchPending when owner is opponent', () => {
      const defeated = makePokemonDefeated({
        owner: 'Gary',
        remainingTeam: 2,
      });

      useBattleStore.getState().addPokemonDefeated(defeated, 'Ash');

      expect(useBattleStore.getState().forcedSwitchPending).toBe(false);
    });

    it('should NOT set forcedSwitchPending when remainingTeam is 0', () => {
      const defeated = makePokemonDefeated({
        owner: 'Ash',
        remainingTeam: 0,
      });

      useBattleStore.getState().addPokemonDefeated(defeated, 'Ash');

      expect(useBattleStore.getState().forcedSwitchPending).toBe(false);
    });
  });

  describe('addPokemonSwitch', () => {
    it('should store lastSwitch, clear forcedSwitchPending, and append event', () => {
      // Set forcedSwitchPending first
      useBattleStore.getState().setForcedSwitchPending(true);

      const switchData = makePokemonSwitch();
      useBattleStore.getState().addPokemonSwitch(switchData);

      const state = useBattleStore.getState();
      expect(state.lastSwitch).toEqual(switchData);
      expect(state.forcedSwitchPending).toBe(false);
      expect(state.events).toHaveLength(1);
      expect(state.events[0]).toEqual({
        type: 'pokemon_switch',
        data: switchData,
      });
    });
  });

  describe('setBattleEnd', () => {
    it('should set finished, winner, clear forcedSwitchPending, and append event', () => {
      useBattleStore.getState().setForcedSwitchPending(true);

      const endData = makeBattleEnd({ winner: 'Ash', loser: 'Gary' });
      useBattleStore.getState().setBattleEnd(endData);

      const state = useBattleStore.getState();
      expect(state.finished).toBe(true);
      expect(state.winner).toBe('Ash');
      expect(state.forcedSwitchPending).toBe(false);
      expect(state.events).toHaveLength(1);
      expect(state.events[0]).toEqual({ type: 'battle_end', data: endData });
    });
  });

  it('should toggle forcedSwitchPending via setForcedSwitchPending', () => {
    useBattleStore.getState().setForcedSwitchPending(true);
    expect(useBattleStore.getState().forcedSwitchPending).toBe(true);

    useBattleStore.getState().setForcedSwitchPending(false);
    expect(useBattleStore.getState().forcedSwitchPending).toBe(false);
  });

  it('should clear everything back to initial via reset', () => {
    useBattleStore.getState().setBattleStarted();
    useBattleStore.getState().addTurnResult(makeTurnResult());
    useBattleStore.getState().setBattleEnd(makeBattleEnd());

    useBattleStore.getState().reset();

    const state = useBattleStore.getState();
    expect(state.started).toBe(false);
    expect(state.finished).toBe(false);
    expect(state.winner).toBeNull();
    expect(state.events).toEqual([]);
    expect(state.lastTurn).toBeNull();
    expect(state.lastSwitch).toBeNull();
    expect(state.forcedSwitchPending).toBe(false);
    expect(state.animating).toBe(false);
  });
});
