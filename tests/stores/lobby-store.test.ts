import { describe, it, expect, beforeEach } from 'vitest';
import { useLobbyStore } from '@/application/stores';
import { LobbyStatus } from '@/domain/enums';
import type { LobbyDTO, PlayerDTO } from '@/domain/dtos';

function makePlayer(overrides: Partial<PlayerDTO> = {}): PlayerDTO {
  return {
    nickname: 'Ash',
    ready: false,
    team: [],
    activePokemonIndex: 0,
    ...overrides,
  };
}

function makeLobby(overrides: Partial<LobbyDTO> = {}): LobbyDTO {
  return {
    status: LobbyStatus.WAITING,
    players: [],
    currentTurnIndex: null,
    winner: null,
    ...overrides,
  };
}

describe('lobbyStore', () => {
  beforeEach(() => {
    useLobbyStore.getState().reset();
  });

  it('should have null initial state', () => {
    const state = useLobbyStore.getState();
    expect(state.lobby).toBeNull();
    expect(state.myNickname).toBeNull();
  });

  it('should store lobby via setLobby', () => {
    const lobby = makeLobby({ players: [makePlayer()] });
    useLobbyStore.getState().setLobby(lobby);

    expect(useLobbyStore.getState().lobby).toEqual(lobby);
  });

  it('should store nickname via setMyNickname', () => {
    useLobbyStore.getState().setMyNickname('Ash');

    expect(useLobbyStore.getState().myNickname).toBe('Ash');
  });

  describe('getMyPlayer', () => {
    it('should return the correct player based on myNickname', () => {
      const me = makePlayer({ nickname: 'Ash' });
      const opponent = makePlayer({ nickname: 'Gary' });
      const lobby = makeLobby({ players: [me, opponent] });

      useLobbyStore.getState().setLobby(lobby);
      useLobbyStore.getState().setMyNickname('Ash');

      expect(useLobbyStore.getState().getMyPlayer()).toEqual(me);
    });

    it('should return null when no lobby', () => {
      useLobbyStore.getState().setMyNickname('Ash');

      expect(useLobbyStore.getState().getMyPlayer()).toBeNull();
    });

    it('should return null when no nickname', () => {
      const lobby = makeLobby({ players: [makePlayer()] });
      useLobbyStore.getState().setLobby(lobby);

      expect(useLobbyStore.getState().getMyPlayer()).toBeNull();
    });
  });

  describe('getOpponent', () => {
    it('should return the other player', () => {
      const me = makePlayer({ nickname: 'Ash' });
      const opponent = makePlayer({ nickname: 'Gary' });
      const lobby = makeLobby({ players: [me, opponent] });

      useLobbyStore.getState().setLobby(lobby);
      useLobbyStore.getState().setMyNickname('Ash');

      expect(useLobbyStore.getState().getOpponent()).toEqual(opponent);
    });

    it('should return null when only one player', () => {
      const me = makePlayer({ nickname: 'Ash' });
      const lobby = makeLobby({ players: [me] });

      useLobbyStore.getState().setLobby(lobby);
      useLobbyStore.getState().setMyNickname('Ash');

      expect(useLobbyStore.getState().getOpponent()).toBeNull();
    });
  });

  describe('isMyTurn', () => {
    it('should return true when currentTurnIndex matches my player position and status is BATTLING', () => {
      const me = makePlayer({ nickname: 'Ash' });
      const opponent = makePlayer({ nickname: 'Gary' });
      const lobby = makeLobby({
        status: LobbyStatus.BATTLING,
        players: [me, opponent],
        currentTurnIndex: 0,
      });

      useLobbyStore.getState().setLobby(lobby);
      useLobbyStore.getState().setMyNickname('Ash');

      expect(useLobbyStore.getState().isMyTurn()).toBe(true);
    });

    it('should return false when not my turn', () => {
      const me = makePlayer({ nickname: 'Ash' });
      const opponent = makePlayer({ nickname: 'Gary' });
      const lobby = makeLobby({
        status: LobbyStatus.BATTLING,
        players: [me, opponent],
        currentTurnIndex: 1,
      });

      useLobbyStore.getState().setLobby(lobby);
      useLobbyStore.getState().setMyNickname('Ash');

      expect(useLobbyStore.getState().isMyTurn()).toBe(false);
    });

    it('should return false when not BATTLING status', () => {
      const me = makePlayer({ nickname: 'Ash' });
      const opponent = makePlayer({ nickname: 'Gary' });
      const lobby = makeLobby({
        status: LobbyStatus.WAITING,
        players: [me, opponent],
        currentTurnIndex: 0,
      });

      useLobbyStore.getState().setLobby(lobby);
      useLobbyStore.getState().setMyNickname('Ash');

      expect(useLobbyStore.getState().isMyTurn()).toBe(false);
    });

    it('should return false when currentTurnIndex is null', () => {
      const me = makePlayer({ nickname: 'Ash' });
      const opponent = makePlayer({ nickname: 'Gary' });
      const lobby = makeLobby({
        status: LobbyStatus.BATTLING,
        players: [me, opponent],
        currentTurnIndex: null,
      });

      useLobbyStore.getState().setLobby(lobby);
      useLobbyStore.getState().setMyNickname('Ash');

      expect(useLobbyStore.getState().isMyTurn()).toBe(false);
    });
  });

  it('should clear lobby but keep myNickname via clearLobby', () => {
    const lobby = makeLobby({ players: [makePlayer()] });
    useLobbyStore.getState().setLobby(lobby);
    useLobbyStore.getState().setMyNickname('Ash');

    useLobbyStore.getState().clearLobby();

    expect(useLobbyStore.getState().lobby).toBeNull();
    expect(useLobbyStore.getState().myNickname).toBe('Ash');
  });

  it('should clear everything via reset', () => {
    const lobby = makeLobby({ players: [makePlayer()] });
    useLobbyStore.getState().setLobby(lobby);
    useLobbyStore.getState().setMyNickname('Ash');

    useLobbyStore.getState().reset();

    expect(useLobbyStore.getState().lobby).toBeNull();
    expect(useLobbyStore.getState().myNickname).toBeNull();
  });
});
