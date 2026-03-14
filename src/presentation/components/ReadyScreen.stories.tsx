import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ReadyScreenView } from './ReadyScreenView';
import { MY_PLAYER, OPPONENT } from './__fixtures__/screenData';

const meta: Meta<typeof ReadyScreenView> = {
  title: 'Screens/ReadyScreen',
  component: ReadyScreenView,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ReadyScreenView>;

const baseArgs = {
  status: 'connected' as const,
  onReady: () => {},
};

export const NotReady: Story = {
  args: {
    ...baseArgs,
    myPlayer: MY_PLAYER,
    opponent: OPPONENT,
    lobbyStatus: 'waiting',
    isReady: false,
    isBothReady: false,
  },
};

export const ImReady: Story = {
  args: {
    ...baseArgs,
    myPlayer: { ...MY_PLAYER, ready: true },
    opponent: OPPONENT,
    lobbyStatus: 'waiting',
    isReady: false,
    isBothReady: false,
  },
};

export const BothReady: Story = {
  args: {
    ...baseArgs,
    myPlayer: { ...MY_PLAYER, ready: true },
    opponent: { ...OPPONENT, ready: true },
    lobbyStatus: 'ready',
    isReady: true,
    isBothReady: true,
  },
};

export const Reconnecting: Story = {
  args: {
    ...baseArgs,
    status: 'reconnecting',
    myPlayer: MY_PLAYER,
    opponent: OPPONENT,
    lobbyStatus: 'waiting',
    isReady: false,
    isBothReady: false,
  },
};
