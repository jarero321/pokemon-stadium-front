/**
 * Shared fixture data for screen stories.
 * NOT for production code.
 */

import type {
  PokemonStateDTO,
  PlayerDTO,
  LobbyDTO,
  PlayerStatsDTO,
  RegisterResponseDTO,
} from '@/domain/dtos';
import { LobbyStatus } from '@/domain/enums';
import type { BattleEvent } from '@/application/stores';

/* ── Pokemon ──────────────────────────────────────────── */

const pokemon = (
  id: number,
  name: string,
  type: string[],
  hp: number,
  maxHp: number,
  attack: number,
  defense: number,
  speed: number,
  defeated = false,
): PokemonStateDTO => ({
  id,
  name,
  type,
  hp,
  maxHp,
  attack,
  defense,
  speed,
  sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
  defeated,
});

export const CHARIZARD = pokemon(
  6,
  'Charizard',
  ['fire', 'flying'],
  153,
  153,
  84,
  78,
  100,
);
export const GENGAR = pokemon(
  94,
  'Gengar',
  ['ghost', 'poison'],
  120,
  120,
  65,
  60,
  110,
);
export const DRAGONITE = pokemon(
  149,
  'Dragonite',
  ['dragon', 'flying'],
  182,
  182,
  134,
  95,
  80,
);

export const BLASTOISE = pokemon(
  9,
  'Blastoise',
  ['water'],
  150,
  150,
  83,
  100,
  78,
);
export const ALAKAZAM = pokemon(
  65,
  'Alakazam',
  ['psychic'],
  110,
  110,
  50,
  65,
  120,
);
export const MACHAMP = pokemon(
  68,
  'Machamp',
  ['fighting'],
  180,
  180,
  130,
  80,
  55,
);

export const PLAYER_TEAM: PokemonStateDTO[] = [CHARIZARD, GENGAR, DRAGONITE];
export const OPPONENT_TEAM: PokemonStateDTO[] = [BLASTOISE, ALAKAZAM, MACHAMP];

/* ── Players ──────────────────────────────────────────── */

export const MY_PLAYER: PlayerDTO = {
  nickname: 'Ash',
  ready: false,
  team: PLAYER_TEAM,
  activePokemonIndex: 0,
};

export const OPPONENT: PlayerDTO = {
  nickname: 'Gary',
  ready: false,
  team: OPPONENT_TEAM,
  activePokemonIndex: 0,
};

/* ── Lobby States ─────────────────────────────────────── */

export const LOBBY_WAITING: LobbyDTO = {
  status: LobbyStatus.WAITING,
  players: [MY_PLAYER],
  currentTurnIndex: null,
  winner: null,
};

export const LOBBY_BOTH_JOINED: LobbyDTO = {
  status: LobbyStatus.WAITING,
  players: [MY_PLAYER, OPPONENT],
  currentTurnIndex: null,
  winner: null,
};

export const LOBBY_BOTH_READY: LobbyDTO = {
  status: LobbyStatus.READY,
  players: [
    { ...MY_PLAYER, ready: true },
    { ...OPPONENT, ready: true },
  ],
  currentTurnIndex: null,
  winner: null,
};

export const LOBBY_BATTLING_MY_TURN: LobbyDTO = {
  status: LobbyStatus.BATTLING,
  players: [MY_PLAYER, OPPONENT],
  currentTurnIndex: 0,
  winner: null,
};

export const LOBBY_BATTLING_OPPONENT_TURN: LobbyDTO = {
  status: LobbyStatus.BATTLING,
  players: [MY_PLAYER, OPPONENT],
  currentTurnIndex: 1,
  winner: null,
};

/* ── Registration ─────────────────────────────────────── */

export const NEW_PLAYER_RESULT: RegisterResponseDTO = {
  player: { nickname: 'Ash', wins: 0, losses: 0, totalBattles: 0, winRate: 0 },
  isNewPlayer: true,
  token: 'fake-token-new',
};

export const RETURNING_PLAYER_RESULT: RegisterResponseDTO = {
  player: {
    nickname: 'Ash',
    wins: 15,
    losses: 8,
    totalBattles: 23,
    winRate: 0.652,
  },
  isNewPlayer: false,
  token: 'fake-token-returning',
};

/* ── Leaderboard ──────────────────────────────────────── */

export const LEADERBOARD: PlayerStatsDTO[] = [
  { nickname: 'Red', wins: 42, losses: 5, totalBattles: 47, winRate: 0.894 },
  { nickname: 'Blue', wins: 38, losses: 10, totalBattles: 48, winRate: 0.792 },
  {
    nickname: 'Cynthia',
    wins: 35,
    losses: 12,
    totalBattles: 47,
    winRate: 0.745,
  },
  { nickname: 'Lance', wins: 28, losses: 15, totalBattles: 43, winRate: 0.651 },
  { nickname: 'Steven', wins: 22, losses: 18, totalBattles: 40, winRate: 0.55 },
];

/* ── Battle Events ────────────────────────────────────── */

export const BATTLE_EVENTS: BattleEvent[] = [
  {
    type: 'turn_result',
    data: {
      turnNumber: 1,
      attacker: { nickname: 'Ash', pokemon: 'Charizard', attack: 84 },
      defender: {
        nickname: 'Gary',
        pokemon: 'Blastoise',
        defense: 100,
        remainingHp: 120,
        maxHp: 150,
      },
      damage: 30,
      typeMultiplier: 0.5,
      defeated: false,
      nextPokemon: null,
      timestamp: '2026-03-14T10:00:00Z',
    },
  },
  {
    type: 'turn_result',
    data: {
      turnNumber: 2,
      attacker: { nickname: 'Gary', pokemon: 'Blastoise', attack: 83 },
      defender: {
        nickname: 'Ash',
        pokemon: 'Charizard',
        defense: 78,
        remainingHp: 90,
        maxHp: 153,
      },
      damage: 63,
      typeMultiplier: 1.5,
      defeated: false,
      nextPokemon: null,
      timestamp: '2026-03-14T10:00:05Z',
    },
  },
  {
    type: 'turn_result',
    data: {
      turnNumber: 3,
      attacker: { nickname: 'Ash', pokemon: 'Charizard', attack: 84 },
      defender: {
        nickname: 'Gary',
        pokemon: 'Blastoise',
        defense: 100,
        remainingHp: 90,
        maxHp: 150,
      },
      damage: 30,
      typeMultiplier: 0.5,
      defeated: false,
      nextPokemon: null,
      timestamp: '2026-03-14T10:00:10Z',
    },
  },
];

export const BATTLE_EVENTS_WITH_END: BattleEvent[] = [
  ...BATTLE_EVENTS,
  {
    type: 'battle_end',
    data: { winner: 'Ash', loser: 'Gary', reason: 'all_defeated' },
  },
];

export const BATTLE_EVENTS_DISCONNECT: BattleEvent[] = [
  ...BATTLE_EVENTS,
  {
    type: 'battle_end',
    data: { winner: 'Ash', loser: 'Gary', reason: 'opponent_disconnected' },
  },
];
