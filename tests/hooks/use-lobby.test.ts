import { describe, it, expect, beforeEach } from 'vitest';
import { useConnectionStore, useLobbyStore } from '@/application/stores';
import { ClientEvent } from '@/domain/events';
import { FakeSocketClient } from '../fakes';

// ── Helpers that replicate useLobby logic without React ─────────────

function simulateJoin(socketClient: FakeSocketClient, nickname: string) {
  if (!socketClient.isConnected()) return;
  useLobbyStore.getState().setMyNickname(nickname);
  socketClient.emit(ClientEvent.JOIN_LOBBY);
}

function simulateAssignPokemon(socketClient: FakeSocketClient) {
  if (!socketClient.isConnected()) return;
  socketClient.emit(ClientEvent.ASSIGN_POKEMON);
}

function simulateMarkReady(socketClient: FakeSocketClient) {
  if (!socketClient.isConnected()) return;
  socketClient.emit(ClientEvent.READY);
}

// ── Tests ───────────────────────────────────────────────────────────

describe('useLobby logic — join', () => {
  let socketClient: FakeSocketClient;

  beforeEach(() => {
    useConnectionStore.getState().reset();
    useLobbyStore.getState().reset();
    socketClient = new FakeSocketClient();
  });

  it('sets myNickname and emits JOIN_LOBBY', () => {
    socketClient.connect('ws://localhost', 'token');

    simulateJoin(socketClient, 'Ash');

    expect(useLobbyStore.getState().myNickname).toBe('Ash');
    const joinEmit = socketClient.emitCalls.find(
      (c) => c.event === ClientEvent.JOIN_LOBBY,
    );
    expect(joinEmit).toBeDefined();
  });

  it('does NOT emit when disconnected', () => {
    simulateJoin(socketClient, 'Ash');

    expect(useLobbyStore.getState().myNickname).toBeNull();
    const joinEmit = socketClient.emitCalls.find(
      (c) => c.event === ClientEvent.JOIN_LOBBY,
    );
    expect(joinEmit).toBeUndefined();
  });
});

describe('useLobby logic — assignPokemon', () => {
  let socketClient: FakeSocketClient;

  beforeEach(() => {
    useConnectionStore.getState().reset();
    useLobbyStore.getState().reset();
    socketClient = new FakeSocketClient();
  });

  it('emits ASSIGN_POKEMON', () => {
    socketClient.connect('ws://localhost', 'token');

    simulateAssignPokemon(socketClient);

    const emit = socketClient.emitCalls.find(
      (c) => c.event === ClientEvent.ASSIGN_POKEMON,
    );
    expect(emit).toBeDefined();
  });

  it('does NOT emit when disconnected', () => {
    simulateAssignPokemon(socketClient);

    const emit = socketClient.emitCalls.find(
      (c) => c.event === ClientEvent.ASSIGN_POKEMON,
    );
    expect(emit).toBeUndefined();
  });
});

describe('useLobby logic — markReady', () => {
  let socketClient: FakeSocketClient;

  beforeEach(() => {
    useConnectionStore.getState().reset();
    useLobbyStore.getState().reset();
    socketClient = new FakeSocketClient();
  });

  it('emits READY', () => {
    socketClient.connect('ws://localhost', 'token');

    simulateMarkReady(socketClient);

    const emit = socketClient.emitCalls.find(
      (c) => c.event === ClientEvent.READY,
    );
    expect(emit).toBeDefined();
  });

  it('does NOT emit when disconnected', () => {
    simulateMarkReady(socketClient);

    const emit = socketClient.emitCalls.find(
      (c) => c.event === ClientEvent.READY,
    );
    expect(emit).toBeUndefined();
  });
});
