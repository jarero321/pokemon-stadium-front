import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NicknameScreenView } from './NicknameScreenView';
import { LeaderboardView } from './LeaderboardView';
import {
  NEW_PLAYER_RESULT,
  RETURNING_PLAYER_RESULT,
  LEADERBOARD,
} from './__fixtures__/screenData';

const leaderboard = <LeaderboardView players={LEADERBOARD} />;

const meta: Meta<typeof NicknameScreenView> = {
  title: 'Screens/NicknameScreen',
  component: NicknameScreenView,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof NicknameScreenView>;

const baseArgs = {
  input: '',
  onInputChange: () => {},
  onSubmit: (e: React.FormEvent) => e.preventDefault(),
  loading: false,
  formError: null,
  registerResult: null,
  connectionError: null,
  onJoinBattle: () => {},
  onUseDifferent: () => {},
  leaderboardSlot: leaderboard,
};

export const Connected: Story = {
  args: {
    ...baseArgs,
    status: 'connected',
    input: 'Ash',
  },
};

export const Connecting: Story = {
  args: {
    ...baseArgs,
    status: 'connecting',
  },
};

export const Disconnected: Story = {
  args: {
    ...baseArgs,
    status: 'idle',
  },
};

export const ConnectionError: Story = {
  args: {
    ...baseArgs,
    status: 'error',
    connectionError: 'Failed to connect to ws://localhost:8080',
  },
};

export const Reconnecting: Story = {
  args: {
    ...baseArgs,
    status: 'reconnecting',
  },
};

export const FormError: Story = {
  args: {
    ...baseArgs,
    status: 'connected',
    input: 'a',
    formError: 'Nickname must be at least 2 characters',
  },
};

export const Loading: Story = {
  args: {
    ...baseArgs,
    status: 'connected',
    input: 'Ash',
    loading: true,
  },
};

export const NewPlayer: Story = {
  args: {
    ...baseArgs,
    status: 'connected',
    registerResult: NEW_PLAYER_RESULT,
  },
};

export const ReturningPlayer: Story = {
  args: {
    ...baseArgs,
    status: 'connected',
    registerResult: RETURNING_PLAYER_RESULT,
  },
};

export const WithoutLeaderboard: Story = {
  args: {
    ...baseArgs,
    status: 'connected',
    input: 'Ash',
    leaderboardSlot: undefined,
  },
};

export const LeaderboardLoading: Story = {
  args: {
    ...baseArgs,
    status: 'connected',
    input: 'Ash',
    leaderboardSlot: <LeaderboardView players={[]} loading />,
  },
};

export const LeaderboardError: Story = {
  args: {
    ...baseArgs,
    status: 'connected',
    input: 'Ash',
    leaderboardSlot: (
      <LeaderboardView players={[]} error="Could not connect to server" />
    ),
  },
};
