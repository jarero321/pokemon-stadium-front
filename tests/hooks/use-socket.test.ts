import { describe, it, expect, beforeEach } from 'vitest';
import {
  useConnectionStore,
  useLobbyStore,
  useBattleStore,
} from '@/application/stores';
import { ServerEvent } from '@/domain/events';
import { LobbyStatus } from '@/domain/enums';
import type {
  LobbyDTO,
  TurnResultDTO,
  PokemonDefeatedDTO,
  PokemonSwitchDTO,
  BattleEndDTO,
} from '@/domain/dtos';
import { FakeSocketClient } from '../fakes';

// ── Simulates the listener registration that useSocket performs ─────

function registerListeners(socketClient: FakeSocketClient) {
  socketClient.on('connect', () => {
    useConnectionStore.getState().setStatus('connected');
  });

  socketClient.on(ServerEvent.LOBBY_STATUS, (data) => {
    useConnectionStore.getState().clearPendingAction();
    useLobbyStore.getState().setLobby(data as LobbyDTO);
  });

  socketClient.on(ServerEvent.BATTLE_START, (data) => {
    useConnectionStore.getState().clearPendingAction();
    useLobbyStore.getState().setLobby(data as LobbyDTO);
    useBattleStore.getState().setBattleStarted();
  });

  socketClient.on(ServerEvent.TURN_RESULT, (data) => {
    useConnectionStore.getState().clearPendingAction();
    useBattleStore.getState().addTurnResult(data as TurnResultDTO);
  });

  socketClient.on(ServerEvent.POKEMON_DEFEATED, (data) => {
    const myNick = useLobbyStore.getState().myNickname;
    useBattleStore
      .getState()
      .addPokemonDefeated(data as PokemonDefeatedDTO, myNick);
  });

  socketClient.on(ServerEvent.POKEMON_SWITCH, (data) => {
    useConnectionStore.getState().clearPendingAction();
    useBattleStore.getState().addPokemonSwitch(data as PokemonSwitchDTO);
  });

  socketClient.on(ServerEvent.BATTLE_END, (data) => {
    useBattleStore.getState().setBattleEnd(data as BattleEndDTO);
  });

  socketClient.on(ServerEvent.ERROR, (data) => {
    const serverError = data as { code: string; message: string };
    useConnectionStore.getState().clearPendingAction();
    useConnectionStore.getState().setServerMessage(serverError);
  });
}

// ── Fixture data ────────────────────────────────────────────────────

const lobbyData: LobbyDTO = {
  status: LobbyStatus.WAITING,
  players: [{ nickname: 'Ash', ready: false, team: [], activePokemonIndex: 0 }],
  currentTurnIndex: null,
  winner: null,
};

const battlingLobbyData: LobbyDTO = {
  status: LobbyStatus.BATTLING,
  players: [
    { nickname: 'Ash', ready: true, team: [], activePokemonIndex: 0 },
    { nickname: 'Gary', ready: true, team: [], activePokemonIndex: 0 },
  ],
  currentTurnIndex: 0,
  winner: null,
};

const turnResultData: TurnResultDTO = {
  turnNumber: 1,
  attacker: { nickname: 'Ash', pokemon: 'Pikachu', attack: 55 },
  defender: {
    nickname: 'Gary',
    pokemon: 'Squirtle',
    defense: 48,
    remainingHp: 30,
    maxHp: 44,
  },
  damage: 14,
  typeMultiplier: 1,
  defeated: false,
  nextPokemon: null,
  timestamp: '2026-03-15T00:00:00Z',
};

const pokemonDefeatedData: PokemonDefeatedDTO = {
  owner: 'Gary',
  pokemon: 'Squirtle',
  defeatedBy: 'Pikachu',
  remainingTeam: 2,
};

const pokemonSwitchData: PokemonSwitchDTO = {
  player: 'Gary',
  previousPokemon: 'Squirtle',
  newPokemon: 'Blastoise',
  newPokemonHp: 79,
  newPokemonMaxHp: 79,
};

const battleEndData: BattleEndDTO = {
  winner: 'Ash',
  loser: 'Gary',
};

// ── Tests ───────────────────────────────────────────────────────────

describe('useSocket logic — server event handling', () => {
  let socketClient: FakeSocketClient;

  beforeEach(() => {
    useConnectionStore.getState().reset();
    useLobbyStore.getState().reset();
    useBattleStore.getState().reset();
    socketClient = new FakeSocketClient();
    registerListeners(socketClient);
  });

  it('connect event sets status to "connected"', () => {
    socketClient.fireEvent('connect', undefined);

    expect(useConnectionStore.getState().status).toBe('connected');
  });

  it('LOBBY_STATUS event updates lobby store and clears pending action', () => {
    useConnectionStore.getState().setPendingAction('join_lobby');

    socketClient.fireEvent(ServerEvent.LOBBY_STATUS, lobbyData);

    expect(useLobbyStore.getState().lobby).toEqual(lobbyData);
    expect(useConnectionStore.getState().pendingAction).toBeNull();
  });

  it('BATTLE_START event updates lobby, sets battle started, clears pending action', () => {
    useConnectionStore.getState().setPendingAction('ready');

    socketClient.fireEvent(ServerEvent.BATTLE_START, battlingLobbyData);

    expect(useLobbyStore.getState().lobby).toEqual(battlingLobbyData);
    expect(useBattleStore.getState().started).toBe(true);
    expect(useConnectionStore.getState().pendingAction).toBeNull();
  });

  it('TURN_RESULT event stores turn result and clears pending action', () => {
    useConnectionStore.getState().setPendingAction('attack');

    socketClient.fireEvent(ServerEvent.TURN_RESULT, turnResultData);

    expect(useBattleStore.getState().lastTurn).toEqual(turnResultData);
    expect(useBattleStore.getState().events).toHaveLength(1);
    expect(useBattleStore.getState().events[0]).toEqual({
      type: 'turn_result',
      data: turnResultData,
    });
    expect(useConnectionStore.getState().pendingAction).toBeNull();
  });

  it('POKEMON_DEFEATED event stores event with correct forcedSwitchPending (opponent defeated)', () => {
    useLobbyStore.getState().setMyNickname('Ash');

    socketClient.fireEvent(ServerEvent.POKEMON_DEFEATED, pokemonDefeatedData);

    expect(useBattleStore.getState().events).toHaveLength(1);
    expect(useBattleStore.getState().events[0]).toEqual({
      type: 'pokemon_defeated',
      data: pokemonDefeatedData,
    });
    // Owner is Gary, myNickname is Ash → forcedSwitchPending should be false
    expect(useBattleStore.getState().forcedSwitchPending).toBe(false);
  });

  it('POKEMON_DEFEATED event sets forcedSwitchPending when my pokemon is defeated', () => {
    useLobbyStore.getState().setMyNickname('Ash');

    const myDefeated: PokemonDefeatedDTO = {
      owner: 'Ash',
      pokemon: 'Pikachu',
      defeatedBy: 'Squirtle',
      remainingTeam: 2,
    };

    socketClient.fireEvent(ServerEvent.POKEMON_DEFEATED, myDefeated);

    expect(useBattleStore.getState().forcedSwitchPending).toBe(true);
  });

  it('POKEMON_SWITCH event stores switch data and clears pending action', () => {
    useConnectionStore.getState().setPendingAction('switch_pokemon');

    socketClient.fireEvent(ServerEvent.POKEMON_SWITCH, pokemonSwitchData);

    expect(useBattleStore.getState().lastSwitch).toEqual(pokemonSwitchData);
    expect(useBattleStore.getState().events).toHaveLength(1);
    expect(useBattleStore.getState().events[0]).toEqual({
      type: 'pokemon_switch',
      data: pokemonSwitchData,
    });
    expect(useConnectionStore.getState().pendingAction).toBeNull();
  });

  it('BATTLE_END event sets finished and winner', () => {
    socketClient.fireEvent(ServerEvent.BATTLE_END, battleEndData);

    expect(useBattleStore.getState().finished).toBe(true);
    expect(useBattleStore.getState().winner).toBe('Ash');
    expect(useBattleStore.getState().events).toHaveLength(1);
    expect(useBattleStore.getState().events[0]).toEqual({
      type: 'battle_end',
      data: battleEndData,
    });
  });

  it('ERROR event stores server message and clears pending action', () => {
    useConnectionStore.getState().setPendingAction('attack');

    const errorData = { code: 'INVALID_ACTION', message: 'Not your turn' };
    socketClient.fireEvent(ServerEvent.ERROR, errorData);

    expect(useConnectionStore.getState().serverMessage).toEqual(errorData);
    expect(useConnectionStore.getState().pendingAction).toBeNull();
  });
});
