import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ResultScreenView } from './ResultScreenView';
import {
  CHARIZARD,
  BLASTOISE,
  GENGAR,
  DRAGONITE,
  ALAKAZAM,
  MACHAMP,
} from './__fixtures__/screenData';

const meta: Meta<typeof ResultScreenView> = {
  title: 'Screens/ResultScreen',
  component: ResultScreenView,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ResultScreenView>;

const noop = () => {};

const baseArgs = {
  totalTurns: 8,
  totalKOs: 3,
  totalDamage: 450,
  reason: 'all_defeated' as const,
  onPlayAgain: noop,
  onExit: noop,
};

const toTeamPokemon = (p: typeof CHARIZARD, defeated = false) => ({
  name: p.name,
  sprite: p.sprite,
  defeated,
});

export const Victory: Story = {
  args: {
    ...baseArgs,
    winner: 'Ash',
    nickname: 'Ash',
    lastPokemonName: CHARIZARD.name,
    lastPokemonSprite: CHARIZARD.sprite,
    lastPokemonTypes: CHARIZARD.type,
    myTeam: [
      toTeamPokemon(CHARIZARD),
      toTeamPokemon(GENGAR, true),
      toTeamPokemon(DRAGONITE),
    ],
    opponentTeam: [
      toTeamPokemon(BLASTOISE, true),
      toTeamPokemon(ALAKAZAM, true),
      toTeamPokemon(MACHAMP, true),
    ],
    myName: 'Ash',
    opponentName: 'Gary',
  },
};

export const Defeat: Story = {
  args: {
    ...baseArgs,
    winner: 'Gary',
    nickname: 'Ash',
    lastPokemonName: BLASTOISE.name,
    lastPokemonSprite: BLASTOISE.sprite,
    lastPokemonTypes: BLASTOISE.type,
    myTeam: [
      toTeamPokemon(CHARIZARD, true),
      toTeamPokemon(GENGAR, true),
      toTeamPokemon(DRAGONITE, true),
    ],
    opponentTeam: [
      toTeamPokemon(BLASTOISE),
      toTeamPokemon(ALAKAZAM, true),
      toTeamPokemon(MACHAMP),
    ],
    myName: 'Ash',
    opponentName: 'Gary',
  },
};

export const VictoryByDisconnect: Story = {
  args: {
    ...baseArgs,
    winner: 'Ash',
    nickname: 'Ash',
    reason: 'opponent_disconnected',
    lastPokemonName: CHARIZARD.name,
    lastPokemonSprite: CHARIZARD.sprite,
    lastPokemonTypes: CHARIZARD.type,
    myTeam: [
      toTeamPokemon(CHARIZARD),
      toTeamPokemon(GENGAR),
      toTeamPokemon(DRAGONITE),
    ],
    opponentTeam: [
      toTeamPokemon(BLASTOISE),
      toTeamPokemon(ALAKAZAM),
      toTeamPokemon(MACHAMP),
    ],
    myName: 'Ash',
    opponentName: 'Gary',
  },
};

export const ShortBattle: Story = {
  args: {
    ...baseArgs,
    winner: 'Ash',
    nickname: 'Ash',
    totalTurns: 1,
    totalKOs: 1,
    totalDamage: 150,
    lastPokemonName: null,
    lastPokemonSprite: null,
    lastPokemonTypes: null,
  },
};
