import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LobbyScreenView } from './LobbyScreenView';
import { MY_PLAYER, OPPONENT } from './__fixtures__/screenData';

const meta: Meta<typeof LobbyScreenView> = {
  title: 'Screens/LobbyScreen',
  component: LobbyScreenView,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof LobbyScreenView>;

const baseArgs = {
  status: 'connected' as const,
  connectionError: null,
  nickname: 'Ash',
  onLeave: () => {},
};

export const WaitingForOpponent: Story = {
  args: {
    ...baseArgs,
    lobbyStatus: 'waiting',
    myPlayer: { ...MY_PLAYER, team: [] },
    opponent: null,
    waitingForOpponent: true,
  },
};

export const BothJoined: Story = {
  args: {
    ...baseArgs,
    lobbyStatus: 'waiting',
    myPlayer: { ...MY_PLAYER, team: [] },
    opponent: { ...OPPONENT, team: [] },
    waitingForOpponent: false,
  },
};

export const TeamsAssigned: Story = {
  args: {
    ...baseArgs,
    lobbyStatus: 'waiting',
    myPlayer: MY_PLAYER,
    opponent: OPPONENT,
    waitingForOpponent: false,
  },
};

export const Reconnecting: Story = {
  args: {
    ...baseArgs,
    status: 'reconnecting',
    lobbyStatus: 'waiting',
    myPlayer: MY_PLAYER,
    opponent: null,
    waitingForOpponent: true,
  },
};

export const ConnectionError: Story = {
  args: {
    ...baseArgs,
    status: 'error',
    connectionError: 'Connection lost',
    lobbyStatus: 'waiting',
    myPlayer: MY_PLAYER,
    opponent: OPPONENT,
    waitingForOpponent: false,
  },
};
