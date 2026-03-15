import { describe, it, expect, beforeEach } from 'vitest';
import {
  useConnectionStore,
  useLobbyStore,
  useBattleStore,
} from '@/application/stores';
import { ClientEvent } from '@/domain/events';
import { LobbyStatus } from '@/domain/enums';
import { FakeSocketClient } from '../fakes';

// ── Helpers that replicate useBattle logic without React ────────────

function simulateAttack(socketClient: FakeSocketClient) {
  const { pendingAction } = useConnectionStore.getState();
  const isMyTurn = useLobbyStore.getState().isMyTurn();

  if (!isMyTurn || pendingAction) return;
  if (!socketClient.isConnected()) return;

  useConnectionStore.getState().setPendingAction('attack');
  socketClient.emit(ClientEvent.ATTACK, { requestId: 'test-uuid' });
}

function simulateSwitch(
  socketClient: FakeSocketClient,
  targetPokemonIndex: number,
) {
  const { pendingAction } = useConnectionStore.getState();
  const isMyTurn = useLobbyStore.getState().isMyTurn();

  if (!isMyTurn || pendingAction) return;
  if (!socketClient.isConnected()) return;

  useConnectionStore.getState().setPendingAction('switch_pokemon');
  socketClient.emit(ClientEvent.SWITCH_POKEMON, {
    requestId: 'test-uuid',
    targetPokemonIndex,
  });
}

// ── Shared setup ────────────────────────────────────────────────────

function setupMyTurn() {
  useLobbyStore.getState().setMyNickname('Ash');
  useLobbyStore.getState().setLobby({
    status: LobbyStatus.BATTLING,
    players: [
      { nickname: 'Ash', ready: true, team: [], activePokemonIndex: 0 },
      { nickname: 'Gary', ready: true, team: [], activePokemonIndex: 0 },
    ],
    currentTurnIndex: 0,
    winner: null,
  });
}

function setupNotMyTurn() {
  useLobbyStore.getState().setMyNickname('Ash');
  useLobbyStore.getState().setLobby({
    status: LobbyStatus.BATTLING,
    players: [
      { nickname: 'Ash', ready: true, team: [], activePokemonIndex: 0 },
      { nickname: 'Gary', ready: true, team: [], activePokemonIndex: 0 },
    ],
    currentTurnIndex: 1,
    winner: null,
  });
}

// ── Tests ───────────────────────────────────────────────────────────

describe('useBattle logic — attack', () => {
  let socketClient: FakeSocketClient;

  beforeEach(() => {
    useConnectionStore.getState().reset();
    useLobbyStore.getState().reset();
    useBattleStore.getState().reset();
    socketClient = new FakeSocketClient();
  });

  it('emits ATTACK event when it is my turn', () => {
    socketClient.connect('ws://localhost', 'token');
    setupMyTurn();

    simulateAttack(socketClient);

    const attackEmit = socketClient.emitCalls.find(
      (c) => c.event === ClientEvent.ATTACK,
    );
    expect(attackEmit).toBeDefined();
    expect(attackEmit!.data).toEqual({ requestId: 'test-uuid' });
  });

  it('sets pendingAction to "attack"', () => {
    socketClient.connect('ws://localhost', 'token');
    setupMyTurn();

    simulateAttack(socketClient);

    expect(useConnectionStore.getState().pendingAction).toBe('attack');
  });

  it('does NOT emit when not my turn', () => {
    socketClient.connect('ws://localhost', 'token');
    setupNotMyTurn();

    simulateAttack(socketClient);

    const attackEmit = socketClient.emitCalls.find(
      (c) => c.event === ClientEvent.ATTACK,
    );
    expect(attackEmit).toBeUndefined();
  });

  it('does NOT emit when pendingAction already set', () => {
    socketClient.connect('ws://localhost', 'token');
    setupMyTurn();
    useConnectionStore.getState().setPendingAction('switch_pokemon');

    simulateAttack(socketClient);

    const attackEmit = socketClient.emitCalls.find(
      (c) => c.event === ClientEvent.ATTACK,
    );
    expect(attackEmit).toBeUndefined();
  });

  it('does NOT emit when socket is disconnected', () => {
    setupMyTurn();
    // socketClient never connected → isConnected() === false

    simulateAttack(socketClient);

    const attackEmit = socketClient.emitCalls.find(
      (c) => c.event === ClientEvent.ATTACK,
    );
    expect(attackEmit).toBeUndefined();
  });
});

describe('useBattle logic — switchPokemon', () => {
  let socketClient: FakeSocketClient;

  beforeEach(() => {
    useConnectionStore.getState().reset();
    useLobbyStore.getState().reset();
    useBattleStore.getState().reset();
    socketClient = new FakeSocketClient();
  });

  it('emits SWITCH_POKEMON with targetPokemonIndex', () => {
    socketClient.connect('ws://localhost', 'token');
    setupMyTurn();

    simulateSwitch(socketClient, 2);

    const switchEmit = socketClient.emitCalls.find(
      (c) => c.event === ClientEvent.SWITCH_POKEMON,
    );
    expect(switchEmit).toBeDefined();
    expect(switchEmit!.data).toEqual({
      requestId: 'test-uuid',
      targetPokemonIndex: 2,
    });
  });

  it('sets pendingAction to "switch_pokemon"', () => {
    socketClient.connect('ws://localhost', 'token');
    setupMyTurn();

    simulateSwitch(socketClient, 1);

    expect(useConnectionStore.getState().pendingAction).toBe('switch_pokemon');
  });

  it('does NOT emit when not my turn', () => {
    socketClient.connect('ws://localhost', 'token');
    setupNotMyTurn();

    simulateSwitch(socketClient, 1);

    const switchEmit = socketClient.emitCalls.find(
      (c) => c.event === ClientEvent.SWITCH_POKEMON,
    );
    expect(switchEmit).toBeUndefined();
  });

  it('does NOT emit when pendingAction already set', () => {
    socketClient.connect('ws://localhost', 'token');
    setupMyTurn();
    useConnectionStore.getState().setPendingAction('attack');

    simulateSwitch(socketClient, 1);

    const switchEmit = socketClient.emitCalls.find(
      (c) => c.event === ClientEvent.SWITCH_POKEMON,
    );
    expect(switchEmit).toBeUndefined();
  });
});
