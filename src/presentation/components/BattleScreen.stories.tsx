import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BattleScreenView } from './BattleScreenView';
import {
  MY_PLAYER,
  OPPONENT,
  CHARIZARD,
  GENGAR,
  DRAGONITE,
} from './__fixtures__/screenData';

const meta: Meta<typeof BattleScreenView> = {
  title: 'Screens/BattleScreen',
  component: BattleScreenView,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof BattleScreenView>;

const noop = () => {};

const baseArgs = {
  status: 'connected' as const,
  myNickname: 'Ash',
  pendingAction: null,
  lastTurn: null,
  forcedSwitchPending: false,
  notYourTurnCount: 0,
  onAttack: noop,
  onSwitchPokemon: noop,
  onForcedSwitch: noop,
  onSurrender: noop,
  turnTimer: null,
  lastSwitch: null,
};

export const MyTurn: Story = {
  args: {
    ...baseArgs,
    myPlayer: MY_PLAYER,
    opponent: OPPONENT,
    isMyTurn: true,
  },
};

export const OpponentTurn: Story = {
  args: {
    ...baseArgs,
    myPlayer: MY_PLAYER,
    opponent: OPPONENT,
    isMyTurn: false,
  },
};

export const PendingAttack: Story = {
  args: {
    ...baseArgs,
    myPlayer: MY_PLAYER,
    opponent: OPPONENT,
    isMyTurn: true,
    pendingAction: 'attack',
  },
};

export const LowHp: Story = {
  args: {
    ...baseArgs,
    myPlayer: {
      ...MY_PLAYER,
      team: [
        { ...CHARIZARD, hp: 20 },
        { ...GENGAR, hp: 0, defeated: true },
        DRAGONITE,
      ],
    },
    opponent: OPPONENT,
    isMyTurn: true,
  },
};

export const ForcedSwitch: Story = {
  args: {
    ...baseArgs,
    myPlayer: {
      ...MY_PLAYER,
      team: [{ ...CHARIZARD, hp: 0, defeated: true }, GENGAR, DRAGONITE],
    },
    opponent: OPPONENT,
    isMyTurn: true,
    forcedSwitchPending: true,
  },
};

export const Reconnecting: Story = {
  args: {
    ...baseArgs,
    status: 'reconnecting',
    myPlayer: MY_PLAYER,
    opponent: OPPONENT,
    isMyTurn: true,
  },
};

export const AllFainted: Story = {
  args: {
    ...baseArgs,
    myPlayer: {
      ...MY_PLAYER,
      team: [
        { ...CHARIZARD, hp: 0, defeated: true },
        { ...GENGAR, hp: 0, defeated: true },
        { ...DRAGONITE, hp: 0, defeated: true },
      ],
    },
    opponent: OPPONENT,
    isMyTurn: false,
  },
};
