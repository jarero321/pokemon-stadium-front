import { describe, it, expect, beforeEach } from 'vitest';
import {
  useConnectionStore,
  useLobbyStore,
  useBattleStore,
} from '@/application/stores';
import { ServerEvent, ClientEvent } from '@/domain/events';
import { LobbyStatus } from '@/domain/enums';
import { FakeSocketClient } from '../fakes';
import type {
  LobbyDTO,
  TurnResultDTO,
  PokemonDefeatedDTO,
  BattleEndDTO,
} from '@/domain/dtos';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Replicates useCurrentView logic without React rendering */
function computeView() {
  const { nickname } = useConnectionStore.getState();
  const { lobby, myNickname } = useLobbyStore.getState();
  const { started, finished } = useBattleStore.getState();

  const myPlayer =
    lobby?.players.find((p) => p.nickname === myNickname) ?? null;

  if (finished) return 'result';
  if (started || lobby?.status === LobbyStatus.BATTLING) return 'battle';
  if (!nickname) return 'nickname';
  if (lobby?.status === LobbyStatus.FINISHED && lobby.winner) return 'result';
  if (lobby?.status === LobbyStatus.FINISHED) return 'lobby';
  if (!lobby) return 'lobby';
  const hasTeam = myPlayer?.team && myPlayer.team.length > 0;
  if (hasTeam) return 'ready';
  return 'lobby';
}

/**
 * Replicates the FIXED useSocket listener logic:
 * - Disconnect: preserve stores, clear pendingAction
 * - LOBBY_STATUS: recover started, forcedSwitchPending, finished
 */
function registerListeners(socketClient: FakeSocketClient) {
  socketClient.on('connect', () => {
    useConnectionStore.getState().setStatus('connected');
  });

  socketClient.on('disconnect', (reason: unknown) => {
    const clientInitiated = reason === 'io client disconnect';
    useConnectionStore.getState().clearPendingAction();

    if (!clientInitiated) {
      useConnectionStore.getState().setStatus('error');
      return;
    }

    // Client-initiated: preserve lobby/battle state, just go idle
    useConnectionStore.getState().setStatus('idle');
  });

  socketClient.on(ServerEvent.LOBBY_STATUS, (data) => {
    useConnectionStore.getState().clearPendingAction();
    const lobby = data as LobbyDTO;
    useLobbyStore.getState().setLobby(lobby);

    const battle = useBattleStore.getState();

    // Recover started
    if (lobby.status === LobbyStatus.BATTLING && !battle.started) {
      useBattleStore.getState().setBattleStarted();
    }

    // Recover forcedSwitchPending
    if (lobby.status === LobbyStatus.BATTLING) {
      const myNick = useLobbyStore.getState().myNickname;
      const myPlayer = lobby.players.find((p) => p.nickname === myNick);
      if (myPlayer) {
        const active = myPlayer.team[myPlayer.activePokemonIndex];
        const hasAlive = myPlayer.team.some(
          (p, i) => !p.defeated && i !== myPlayer.activePokemonIndex,
        );
        if (active?.defeated && hasAlive) {
          useBattleStore.getState().setForcedSwitchPending(true);
        }
      }
    }

    // Recover finished
    if (
      lobby.status === LobbyStatus.FINISHED &&
      lobby.winner &&
      !battle.finished
    ) {
      const loser =
        lobby.players.find((p) => p.nickname !== lobby.winner)?.nickname ?? '';
      useBattleStore.getState().setBattleEnd({
        winner: lobby.winner,
        loser,
        reason: 'reconnect_sync',
      });
    }
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

  socketClient.on(ServerEvent.BATTLE_END, (data) => {
    useBattleStore.getState().setBattleEnd(data as BattleEndDTO);
  });

  socketClient.on(ServerEvent.ERROR, (data) => {
    const serverError = data as { code: string; message: string };
    useConnectionStore.getState().clearPendingAction();
    useConnectionStore.getState().setServerMessage(serverError);
  });
}

/** Simulates GameProvider auto-rejoin */
function simulateAutoRejoin(socketClient: FakeSocketClient) {
  const { status, nickname } = useConnectionStore.getState();
  const { lobby } = useLobbyStore.getState();

  if (status === 'connected' && nickname && !lobby) {
    useLobbyStore.getState().setMyNickname(nickname);
    socketClient.emit(ClientEvent.JOIN_LOBBY);
  }
}

/** Simulates a hot-reload: cleanup disconnect → re-connect */
function simulateHotReload(socketClient: FakeSocketClient) {
  socketClient.disconnect();
  socketClient.fireEvent('disconnect', 'io client disconnect');

  const { baseUrl, token } = useConnectionStore.getState();
  if (baseUrl && token) {
    socketClient.connect(baseUrl, token);
  }
}

/** Factory for a lobby in BATTLING state */
function makeBattlingLobby(overrides?: Partial<LobbyDTO>): LobbyDTO {
  return {
    status: LobbyStatus.BATTLING,
    players: [
      {
        nickname: 'Ash',
        ready: true,
        team: [
          {
            id: 25,
            name: 'Pikachu',
            type: ['Electric'],
            hp: 35,
            maxHp: 35,
            attack: 55,
            defense: 40,
            speed: 90,
            sprite: '',
            defeated: false,
          },
          {
            id: 6,
            name: 'Charizard',
            type: ['Fire', 'Flying'],
            hp: 78,
            maxHp: 78,
            attack: 84,
            defense: 78,
            speed: 100,
            sprite: '',
            defeated: false,
          },
          {
            id: 9,
            name: 'Blastoise',
            type: ['Water'],
            hp: 79,
            maxHp: 79,
            attack: 83,
            defense: 100,
            speed: 78,
            sprite: '',
            defeated: false,
          },
        ],
        activePokemonIndex: 0,
      },
      {
        nickname: 'Gary',
        ready: true,
        team: [
          {
            id: 150,
            name: 'Mewtwo',
            type: ['Psychic'],
            hp: 106,
            maxHp: 106,
            attack: 110,
            defense: 90,
            speed: 130,
            sprite: '',
            defeated: false,
          },
          {
            id: 94,
            name: 'Gengar',
            type: ['Ghost', 'Poison'],
            hp: 60,
            maxHp: 60,
            attack: 65,
            defense: 60,
            speed: 110,
            sprite: '',
            defeated: false,
          },
          {
            id: 143,
            name: 'Snorlax',
            type: ['Normal'],
            hp: 160,
            maxHp: 160,
            attack: 110,
            defense: 65,
            speed: 30,
            sprite: '',
            defeated: false,
          },
        ],
        activePokemonIndex: 0,
      },
    ],
    currentTurnIndex: 0,
    winner: null,
    ...overrides,
  };
}

function makeTurnResult(
  turnNumber: number,
  overrides?: Partial<TurnResultDTO>,
): TurnResultDTO {
  return {
    turnNumber,
    attacker: { nickname: 'Ash', pokemon: 'Pikachu', attack: 55 },
    defender: {
      nickname: 'Gary',
      pokemon: 'Mewtwo',
      defense: 90,
      remainingHp: 105,
      maxHp: 106,
    },
    damage: 1,
    typeMultiplier: 1,
    defeated: false,
    nextPokemon: null,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

// ─── Setup ──────────────────────────────────────────────────────────────────

function setupMidBattle(socketClient: FakeSocketClient) {
  useConnectionStore.getState().setBaseUrl('http://192.168.1.100:8080');
  useConnectionStore.getState().setToken('jwt-ash-token');
  useConnectionStore.getState().setNickname('Ash');
  useConnectionStore.getState().setStatus('connected');

  useLobbyStore.getState().setMyNickname('Ash');
  useLobbyStore.getState().setLobby(makeBattlingLobby());

  useBattleStore.getState().setBattleStarted();
  useBattleStore.getState().addTurnResult(makeTurnResult(1));
  useBattleStore.getState().addTurnResult(
    makeTurnResult(2, {
      attacker: { nickname: 'Gary', pokemon: 'Mewtwo', attack: 110 },
      defender: {
        nickname: 'Ash',
        pokemon: 'Pikachu',
        defense: 40,
        remainingHp: 20,
        maxHp: 35,
      },
      damage: 15,
    }),
  );

  registerListeners(socketClient);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Socket Desynchronization — Hot Reload Recovery', () => {
  let socketClient: FakeSocketClient;

  beforeEach(() => {
    useConnectionStore.getState().reset();
    useLobbyStore.getState().reset();
    useBattleStore.getState().reset();
    socketClient = new FakeSocketClient();
  });

  // ─── Fix 1: Stores preserved across hot reload ────────────────────────

  describe('Stores preserved on client-initiated disconnect', () => {
    it('should preserve battleStore.started after hot reload disconnect', () => {
      setupMidBattle(socketClient);

      socketClient.fireEvent('disconnect', 'io client disconnect');

      // FIXED: stores are NOT reset anymore
      expect(useBattleStore.getState().started).toBe(true);
      expect(useBattleStore.getState().events).toHaveLength(2);
      expect(useBattleStore.getState().lastTurn).not.toBeNull();
    });

    it('should preserve lobby state after hot reload disconnect', () => {
      setupMidBattle(socketClient);

      socketClient.fireEvent('disconnect', 'io client disconnect');

      expect(useLobbyStore.getState().lobby).not.toBeNull();
      expect(useLobbyStore.getState().lobby?.status).toBe(LobbyStatus.BATTLING);
      expect(useLobbyStore.getState().myNickname).toBe('Ash');
    });

    it('should clear pendingAction on disconnect', () => {
      setupMidBattle(socketClient);
      useConnectionStore.getState().setPendingAction('attack');

      socketClient.fireEvent('disconnect', 'io client disconnect');

      expect(useConnectionStore.getState().pendingAction).toBeNull();
    });

    it('should set status to idle on client-initiated disconnect', () => {
      setupMidBattle(socketClient);

      socketClient.fireEvent('disconnect', 'io client disconnect');

      expect(useConnectionStore.getState().status).toBe('idle');
    });

    it('should keep view as battle after hot reload disconnect', () => {
      setupMidBattle(socketClient);

      socketClient.fireEvent('disconnect', 'io client disconnect');

      expect(computeView()).toBe('battle');
    });
  });

  // ─── Fix 2: LOBBY_STATUS recovers started flag ────────────────────────

  describe('LOBBY_STATUS recovers battleStore.started', () => {
    it('should set started=true when LOBBY_STATUS arrives with BATTLING and started is false', () => {
      // Simulate a scenario where started was somehow lost
      useConnectionStore.getState().setBaseUrl('http://192.168.1.100:8080');
      useConnectionStore.getState().setToken('jwt-ash-token');
      useConnectionStore.getState().setNickname('Ash');
      useConnectionStore.getState().setStatus('connected');
      useLobbyStore.getState().setMyNickname('Ash');
      registerListeners(socketClient);

      // started is false
      expect(useBattleStore.getState().started).toBe(false);

      // Server sends LOBBY_STATUS with BATTLING
      socketClient.fireEvent(ServerEvent.LOBBY_STATUS, makeBattlingLobby());

      // FIXED: started is recovered
      expect(useBattleStore.getState().started).toBe(true);
    });

    it('should NOT double-set started if already true', () => {
      setupMidBattle(socketClient);
      expect(useBattleStore.getState().started).toBe(true);

      // Another LOBBY_STATUS arrives — should not cause issues
      socketClient.fireEvent(ServerEvent.LOBBY_STATUS, makeBattlingLobby());

      expect(useBattleStore.getState().started).toBe(true);
    });
  });

  // ─── Fix 3: LOBBY_STATUS recovers forcedSwitchPending ─────────────────

  describe('LOBBY_STATUS recovers forcedSwitchPending', () => {
    it('should detect forced switch when active pokemon is defeated', () => {
      useConnectionStore.getState().setBaseUrl('http://192.168.1.100:8080');
      useConnectionStore.getState().setToken('jwt-ash-token');
      useConnectionStore.getState().setNickname('Ash');
      useConnectionStore.getState().setStatus('connected');
      useLobbyStore.getState().setMyNickname('Ash');
      registerListeners(socketClient);

      // Server sends lobby where Ash's active pokemon (index 0) is defeated
      const lobby = makeBattlingLobby();
      lobby.players[0].team[0].defeated = true;
      lobby.players[0].team[0].hp = 0;
      socketClient.fireEvent(ServerEvent.LOBBY_STATUS, lobby);

      // FIXED: forcedSwitchPending is derived from team state
      expect(useBattleStore.getState().forcedSwitchPending).toBe(true);
    });

    it('should NOT set forcedSwitchPending when active pokemon is alive', () => {
      useConnectionStore.getState().setBaseUrl('http://192.168.1.100:8080');
      useConnectionStore.getState().setToken('jwt-ash-token');
      useConnectionStore.getState().setNickname('Ash');
      useConnectionStore.getState().setStatus('connected');
      useLobbyStore.getState().setMyNickname('Ash');
      registerListeners(socketClient);

      socketClient.fireEvent(ServerEvent.LOBBY_STATUS, makeBattlingLobby());

      expect(useBattleStore.getState().forcedSwitchPending).toBe(false);
    });

    it('should NOT set forcedSwitchPending when all alternatives are also defeated', () => {
      useConnectionStore.getState().setBaseUrl('http://192.168.1.100:8080');
      useConnectionStore.getState().setToken('jwt-ash-token');
      useConnectionStore.getState().setNickname('Ash');
      useConnectionStore.getState().setStatus('connected');
      useLobbyStore.getState().setMyNickname('Ash');
      registerListeners(socketClient);

      const lobby = makeBattlingLobby();
      // All pokemon defeated — battle should end, not force switch
      lobby.players[0].team[0].defeated = true;
      lobby.players[0].team[0].hp = 0;
      lobby.players[0].team[1].defeated = true;
      lobby.players[0].team[1].hp = 0;
      lobby.players[0].team[2].defeated = true;
      lobby.players[0].team[2].hp = 0;
      socketClient.fireEvent(ServerEvent.LOBBY_STATUS, lobby);

      expect(useBattleStore.getState().forcedSwitchPending).toBe(false);
    });
  });

  // ─── Fix 4: LOBBY_STATUS recovers finished state ──────────────────────

  describe('LOBBY_STATUS recovers battle finished state', () => {
    it('should set finished + winner when LOBBY_STATUS arrives with FINISHED and winner', () => {
      useConnectionStore.getState().setBaseUrl('http://192.168.1.100:8080');
      useConnectionStore.getState().setToken('jwt-ash-token');
      useConnectionStore.getState().setNickname('Ash');
      useConnectionStore.getState().setStatus('connected');
      useLobbyStore.getState().setMyNickname('Ash');
      registerListeners(socketClient);

      const finishedLobby: LobbyDTO = {
        ...makeBattlingLobby(),
        status: LobbyStatus.FINISHED,
        winner: 'Gary',
      };
      socketClient.fireEvent(ServerEvent.LOBBY_STATUS, finishedLobby);

      // FIXED: finished and winner are recovered
      expect(useBattleStore.getState().finished).toBe(true);
      expect(useBattleStore.getState().winner).toBe('Gary');
      expect(computeView()).toBe('result');
    });

    it('should include loser in the recovered battle end event', () => {
      useConnectionStore.getState().setBaseUrl('http://192.168.1.100:8080');
      useConnectionStore.getState().setToken('jwt-ash-token');
      useConnectionStore.getState().setNickname('Ash');
      useConnectionStore.getState().setStatus('connected');
      useLobbyStore.getState().setMyNickname('Ash');
      registerListeners(socketClient);

      const finishedLobby: LobbyDTO = {
        ...makeBattlingLobby(),
        status: LobbyStatus.FINISHED,
        winner: 'Ash',
      };
      socketClient.fireEvent(ServerEvent.LOBBY_STATUS, finishedLobby);

      const lastEvent = useBattleStore.getState().events.at(-1);
      expect(lastEvent?.type).toBe('battle_end');
      if (lastEvent?.type === 'battle_end') {
        expect(lastEvent.data.winner).toBe('Ash');
        expect(lastEvent.data.loser).toBe('Gary');
        expect(lastEvent.data.reason).toBe('reconnect_sync');
      }
    });

    it('should NOT override finished if already set', () => {
      setupMidBattle(socketClient);

      // Battle ends normally
      useBattleStore.getState().setBattleEnd({
        winner: 'Ash',
        loser: 'Gary',
        battleId: 'battle-123',
      });

      const eventsBefore = useBattleStore.getState().events.length;

      // LOBBY_STATUS arrives — should not duplicate the end event
      const finishedLobby: LobbyDTO = {
        ...makeBattlingLobby(),
        status: LobbyStatus.FINISHED,
        winner: 'Ash',
      };
      socketClient.fireEvent(ServerEvent.LOBBY_STATUS, finishedLobby);

      expect(useBattleStore.getState().events.length).toBe(eventsBefore);
    });
  });

  // ─── Fix 5: Server-initiated disconnect is not nuclear ────────────────

  describe('Server-initiated disconnect (graceful)', () => {
    it('should set error status instead of hard redirect', () => {
      setupMidBattle(socketClient);

      socketClient.fireEvent('disconnect', 'transport close');

      // FIXED: no hard redirect, just error status
      expect(useConnectionStore.getState().status).toBe('error');
    });

    it('should preserve credentials for reconnection', () => {
      setupMidBattle(socketClient);

      socketClient.fireEvent('disconnect', 'transport close');

      // Credentials preserved — user can reconnect
      expect(useConnectionStore.getState().token).toBe('jwt-ash-token');
      expect(useConnectionStore.getState().nickname).toBe('Ash');
      expect(useConnectionStore.getState().baseUrl).toBe(
        'http://192.168.1.100:8080',
      );
    });

    it('should preserve battle state for recovery', () => {
      setupMidBattle(socketClient);

      socketClient.fireEvent('disconnect', 'ping timeout');

      // Battle state intact — ready for reconnect
      expect(useBattleStore.getState().started).toBe(true);
      expect(useBattleStore.getState().events).toHaveLength(2);
      expect(useLobbyStore.getState().lobby?.status).toBe(LobbyStatus.BATTLING);
    });

    it('should clear pendingAction on server disconnect', () => {
      setupMidBattle(socketClient);
      useConnectionStore.getState().setPendingAction('attack');

      socketClient.fireEvent('disconnect', 'transport close');

      expect(useConnectionStore.getState().pendingAction).toBeNull();
    });
  });

  // ─── Full reconnection flows ──────────────────────────────────────────

  describe('Full hot reload → reconnect → sync flow', () => {
    it('should fully recover battle state after hot reload', () => {
      setupMidBattle(socketClient);

      // Verify pre-conditions
      expect(useBattleStore.getState().started).toBe(true);
      expect(useBattleStore.getState().events).toHaveLength(2);

      // Hot reload
      simulateHotReload(socketClient);

      // State preserved through hot reload
      expect(useBattleStore.getState().started).toBe(true);
      expect(useBattleStore.getState().events).toHaveLength(2);
      expect(useLobbyStore.getState().lobby?.status).toBe(LobbyStatus.BATTLING);
      expect(computeView()).toBe('battle');

      // Server sends updated lobby
      socketClient.fireEvent(
        ServerEvent.LOBBY_STATUS,
        makeBattlingLobby({ currentTurnIndex: 1 }),
      );

      // Lobby synced with server, battle still active
      expect(useLobbyStore.getState().isMyTurn()).toBe(false); // Gary's turn now
      expect(useBattleStore.getState().started).toBe(true);
    });

    it('should process new turns seamlessly after hot reload', () => {
      setupMidBattle(socketClient);

      simulateHotReload(socketClient);
      socketClient.fireEvent(
        ServerEvent.LOBBY_STATUS,
        makeBattlingLobby({ currentTurnIndex: 0 }),
      );

      // New turn arrives
      const turn = makeTurnResult(3, { damage: 25 });
      socketClient.fireEvent(ServerEvent.TURN_RESULT, turn);

      // Turn 3 processed, and we still have turns 1-2 from before hot reload
      expect(useBattleStore.getState().lastTurn?.turnNumber).toBe(3);
      expect(useBattleStore.getState().events).toHaveLength(3); // turns 1, 2, 3
    });

    it('should handle battle ending after hot reload', () => {
      setupMidBattle(socketClient);

      simulateHotReload(socketClient);
      socketClient.fireEvent(ServerEvent.LOBBY_STATUS, makeBattlingLobby());

      // Battle ends
      socketClient.fireEvent(ServerEvent.BATTLE_END, {
        winner: 'Ash',
        loser: 'Gary',
        battleId: 'battle-456',
      });

      expect(useBattleStore.getState().finished).toBe(true);
      expect(useBattleStore.getState().winner).toBe('Ash');
      expect(computeView()).toBe('result');
    });

    it('should handle pending action cleared + retry after hot reload', () => {
      setupMidBattle(socketClient);
      useConnectionStore.getState().setPendingAction('attack');

      // Hot reload clears pending action
      simulateHotReload(socketClient);
      expect(useConnectionStore.getState().pendingAction).toBeNull();

      // Server syncs lobby
      socketClient.fireEvent(
        ServerEvent.LOBBY_STATUS,
        makeBattlingLobby({ currentTurnIndex: 0 }),
      );

      // Player can attack again
      const isMyTurn = useLobbyStore.getState().isMyTurn();
      const { pendingAction } = useConnectionStore.getState();
      expect(isMyTurn && !pendingAction).toBe(true);
    });
  });

  // ─── Rapid hot reload cycles ──────────────────────────────────────────

  describe('Rapid disconnect/reconnect cycles', () => {
    it('should handle two consecutive hot reloads without data loss', () => {
      setupMidBattle(socketClient);

      simulateHotReload(socketClient);
      socketClient.fireEvent(ServerEvent.LOBBY_STATUS, makeBattlingLobby());

      simulateHotReload(socketClient);
      socketClient.fireEvent(ServerEvent.LOBBY_STATUS, makeBattlingLobby());

      expect(useBattleStore.getState().started).toBe(true);
      expect(useBattleStore.getState().events).toHaveLength(2); // preserved
      expect(useLobbyStore.getState().lobby?.players).toHaveLength(2);
    });

    it('should not accumulate unnecessary JOIN_LOBBY when lobby is preserved', () => {
      setupMidBattle(socketClient);

      // After hot reload, lobby is preserved → auto-rejoin guard (!lobby) is false
      simulateHotReload(socketClient);

      // lobby still exists → simulateAutoRejoin should NOT emit
      simulateAutoRejoin(socketClient);

      const joinEmits = socketClient.emitCalls.filter(
        (c) => c.event === ClientEvent.JOIN_LOBBY,
      );
      expect(joinEmits).toHaveLength(0);
    });
  });

  // ─── Disconnect during READY → BATTLING transition ────────────────────

  describe('Disconnect during ready-to-battle transition', () => {
    it('should recover started flag via LOBBY_STATUS even if BATTLE_START was missed', () => {
      useConnectionStore.getState().setBaseUrl('http://192.168.1.100:8080');
      useConnectionStore.getState().setToken('jwt-ash-token');
      useConnectionStore.getState().setNickname('Ash');
      useConnectionStore.getState().setStatus('connected');
      useLobbyStore.getState().setMyNickname('Ash');

      const readyLobby: LobbyDTO = {
        status: LobbyStatus.READY,
        players: [
          {
            nickname: 'Ash',
            ready: true,
            team: makeBattlingLobby().players[0].team,
            activePokemonIndex: 0,
          },
          {
            nickname: 'Gary',
            ready: true,
            team: makeBattlingLobby().players[1].team,
            activePokemonIndex: 0,
          },
        ],
        currentTurnIndex: null,
        winner: null,
      };
      useLobbyStore.getState().setLobby(readyLobby);
      registerListeners(socketClient);

      // Hot reload — BATTLE_START was never received
      simulateHotReload(socketClient);

      // Server sends LOBBY_STATUS with BATTLING
      socketClient.fireEvent(ServerEvent.LOBBY_STATUS, makeBattlingLobby());

      // FIXED: started is recovered from lobby status
      expect(useBattleStore.getState().started).toBe(true);
      expect(computeView()).toBe('battle');
    });
  });

  // ─── Battle ends while disconnected ───────────────────────────────────

  describe('Battle ends while disconnected', () => {
    it('should recover winner from LOBBY_STATUS with FINISHED', () => {
      setupMidBattle(socketClient);

      // Hot reload
      simulateHotReload(socketClient);

      // Server sends LOBBY_STATUS with FINISHED + winner
      const finishedLobby: LobbyDTO = {
        ...makeBattlingLobby(),
        status: LobbyStatus.FINISHED,
        winner: 'Gary',
      };
      socketClient.fireEvent(ServerEvent.LOBBY_STATUS, finishedLobby);

      // FIXED: finished and winner are recovered
      expect(useBattleStore.getState().finished).toBe(true);
      expect(useBattleStore.getState().winner).toBe('Gary');
      expect(computeView()).toBe('result');
    });
  });

  // ─── Forced switch during disconnect ──────────────────────────────────

  describe('Forced switch pending during disconnect', () => {
    it('should recover forcedSwitchPending from server lobby state', () => {
      setupMidBattle(socketClient);

      // Hot reload
      simulateHotReload(socketClient);

      // Server sends lobby where Ash's active pokemon is defeated
      const lobby = makeBattlingLobby({ currentTurnIndex: 0 });
      lobby.players[0].team[0].defeated = true;
      lobby.players[0].team[0].hp = 0;
      socketClient.fireEvent(ServerEvent.LOBBY_STATUS, lobby);

      // FIXED: forcedSwitchPending recovered
      expect(useBattleStore.getState().forcedSwitchPending).toBe(true);
    });
  });

  // ─── State coherence after full recovery ──────────────────────────────

  describe('State coherence after recovery', () => {
    it('should have fully consistent state after hot reload + sync', () => {
      setupMidBattle(socketClient);
      simulateHotReload(socketClient);
      socketClient.fireEvent(
        ServerEvent.LOBBY_STATUS,
        makeBattlingLobby({ currentTurnIndex: 0 }),
      );

      const connection = useConnectionStore.getState();
      const lobbyState = useLobbyStore.getState();
      const battle = useBattleStore.getState();

      // Connection: recovered
      expect(connection.status).toBe('connected');
      expect(connection.nickname).toBe('Ash');
      expect(connection.pendingAction).toBeNull();

      // Lobby: synced with server
      expect(lobbyState.lobby?.status).toBe(LobbyStatus.BATTLING);
      expect(lobbyState.myNickname).toBe('Ash');
      expect(lobbyState.isMyTurn()).toBe(true);

      // Battle: fully intact
      expect(battle.started).toBe(true);
      expect(battle.events).toHaveLength(2); // preserved from before
      expect(battle.lastTurn).not.toBeNull();
      expect(battle.finished).toBe(false);

      expect(computeView()).toBe('battle');
    });
  });

  // ─── Error event during reconnect ─────────────────────────────────────

  describe('Server error during reconnection', () => {
    it('should handle ALREADY_JOINED gracefully', () => {
      setupMidBattle(socketClient);
      simulateHotReload(socketClient);

      socketClient.fireEvent(ServerEvent.ERROR, {
        code: 'ALREADY_JOINED',
        message: 'You are already in the lobby',
      });

      expect(useConnectionStore.getState().pendingAction).toBeNull();
      expect(useConnectionStore.getState().serverMessage).toEqual({
        code: 'ALREADY_JOINED',
        message: 'You are already in the lobby',
      });

      // Battle state still intact
      expect(useBattleStore.getState().started).toBe(true);
    });
  });
});
