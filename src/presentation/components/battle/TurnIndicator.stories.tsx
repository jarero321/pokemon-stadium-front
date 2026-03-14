import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TurnIndicator } from './TurnIndicator';

const meta: Meta<typeof TurnIndicator> = {
  title: 'Battle/TurnIndicator',
  component: TurnIndicator,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof TurnIndicator>;

export const MyTurn: Story = {
  args: { isMyTurn: true, children: 'Your turn — choose an action!' },
};

export const Waiting: Story = {
  args: { isMyTurn: false, children: "Opponent's turn — waiting..." },
};

export const SideBySide = {
  name: 'Both States',
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <TurnIndicator isMyTurn={true}>Your turn!</TurnIndicator>
      <TurnIndicator isMyTurn={false}>Opponent attacking...</TurnIndicator>
    </div>
  ),
};
