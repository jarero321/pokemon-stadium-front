import { describe, it, expect, beforeEach } from 'vitest';
import {
  useConnectionStore,
  useLobbyStore,
  useBattleStore,
} from '@/application/stores';
import type { GameView } from '@/application/stores';
import { LobbyStatus } from '@/domain/enums';
import type { LobbyDTO, PlayerDTO, PokemonStateDTO } from '@/domain/dtos';

function makePlayer(overrides: Partial<PlayerDTO> = {}): PlayerDTO {
  return {
    nickname: 'Ash',
    ready: false,
    team: [],
    activePokemonIndex: 0,
    ...overrides,
  };
}

function makePokemon(
  overrides: Partial<PokemonStateDTO> = {},
): PokemonStateDTO {
  return {
    id: 25,
    name: 'Pikachu',
    type: ['electric'],
    hp: 100,
    maxHp: 100,
    attack: 55,
    defense: 40,
    speed: 90,
    sprite: 'pikachu.png',
    defeated: false,
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

/**
 * Replicates the view derivation logic from useCurrentView using getState()
 * instead of React hooks, so we can test without a rendering context.
 */
function computeView(): GameView {
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

describe('viewStore — useCurrentView logic', () => {
  beforeEach(() => {
    useConnectionStore.getState().reset();
    useLobbyStore.getState().reset();
    useBattleStore.getState().reset();
  });

  it('should return "nickname" when no nickname set', () => {
    expect(computeView()).toBe('nickname');
  });

  it('should return "lobby" when nickname set but no lobby', () => {
    useConnectionStore.getState().setNickname('Ash');

    expect(computeView()).toBe('lobby');
  });

  it('should return "lobby" when lobby has players but no team', () => {
    useConnectionStore.getState().setNickname('Ash');
    useLobbyStore.getState().setMyNickname('Ash');
    useLobbyStore.getState().setLobby(
      makeLobby({
        players: [
          makePlayer({ nickname: 'Ash' }),
          makePlayer({ nickname: 'Gary' }),
        ],
      }),
    );

    expect(computeView()).toBe('lobby');
  });

  it('should return "ready" when my player has a team', () => {
    useConnectionStore.getState().setNickname('Ash');
    useLobbyStore.getState().setMyNickname('Ash');
    useLobbyStore.getState().setLobby(
      makeLobby({
        players: [
          makePlayer({ nickname: 'Ash', team: [makePokemon()] }),
          makePlayer({ nickname: 'Gary' }),
        ],
      }),
    );

    expect(computeView()).toBe('ready');
  });

  it('should return "battle" when battle started', () => {
    useConnectionStore.getState().setNickname('Ash');
    useBattleStore.getState().setBattleStarted();

    expect(computeView()).toBe('battle');
  });

  it('should return "battle" when lobby status is BATTLING', () => {
    useConnectionStore.getState().setNickname('Ash');
    useLobbyStore.getState().setMyNickname('Ash');
    useLobbyStore.getState().setLobby(
      makeLobby({
        status: LobbyStatus.BATTLING,
        players: [
          makePlayer({ nickname: 'Ash' }),
          makePlayer({ nickname: 'Gary' }),
        ],
      }),
    );

    expect(computeView()).toBe('battle');
  });

  it('should return "result" when battle finished', () => {
    useConnectionStore.getState().setNickname('Ash');
    useBattleStore.getState().setBattleEnd({
      winner: 'Ash',
      loser: 'Gary',
    });

    expect(computeView()).toBe('result');
  });

  it('should return "result" when lobby FINISHED with winner', () => {
    useConnectionStore.getState().setNickname('Ash');
    useLobbyStore.getState().setMyNickname('Ash');
    useLobbyStore.getState().setLobby(
      makeLobby({
        status: LobbyStatus.FINISHED,
        winner: 'Ash',
        players: [
          makePlayer({ nickname: 'Ash' }),
          makePlayer({ nickname: 'Gary' }),
        ],
      }),
    );

    expect(computeView()).toBe('result');
  });

  it('should return "lobby" when lobby FINISHED without winner (opponent left)', () => {
    useConnectionStore.getState().setNickname('Ash');
    useLobbyStore.getState().setMyNickname('Ash');
    useLobbyStore.getState().setLobby(
      makeLobby({
        status: LobbyStatus.FINISHED,
        winner: null,
        players: [makePlayer({ nickname: 'Ash' })],
      }),
    );

    expect(computeView()).toBe('lobby');
  });

  it('should return "result" when finished=true even with other conditions set (priority check)', () => {
    useConnectionStore.getState().setNickname('Ash');
    useLobbyStore.getState().setMyNickname('Ash');
    useLobbyStore.getState().setLobby(
      makeLobby({
        status: LobbyStatus.BATTLING,
        players: [
          makePlayer({ nickname: 'Ash', team: [makePokemon()] }),
          makePlayer({ nickname: 'Gary' }),
        ],
      }),
    );
    useBattleStore.getState().setBattleStarted();
    useBattleStore.getState().setBattleEnd({
      winner: 'Ash',
      loser: 'Gary',
    });

    expect(computeView()).toBe('result');
  });
});
