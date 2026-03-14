import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { Pokeball } from './Pokeball';
import type { PokeballState } from './Pokeball';

const meta: Meta<typeof Pokeball> = {
  title: 'Battle/Pokeball',
  component: Pokeball,
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'throwing', 'opening', 'done'],
    },
    size: { control: { type: 'range', min: 24, max: 96, step: 8 } },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Pokeball>;

export const Idle: Story = {
  args: { state: 'idle', size: 48 },
};

export const Throwing: Story = {
  args: { state: 'throwing', size: 48 },
};

export const Interactive = {
  render: () => {
    const [state, setState] = useState<PokeballState>('idle');
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="h-32 w-64 flex items-center justify-center">
          <Pokeball
            state={state}
            size={48}
            onComplete={() => setState('idle')}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setState('throwing')}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white"
          >
            Throw!
          </button>
          <button
            onClick={() => setState('idle')}
            className="rounded bg-gray-600 px-4 py-2 text-sm text-white"
          >
            Reset
          </button>
        </div>
      </div>
    );
  },
};
