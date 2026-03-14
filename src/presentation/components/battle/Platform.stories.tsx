import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Platform } from './Platform';

const meta: Meta<typeof Platform> = {
  title: 'Battle/Platform',
  component: Platform,
  argTypes: {
    variant: { control: 'select', options: ['player', 'opponent'] },
    typeName: {
      control: 'select',
      options: [
        'fire',
        'water',
        'grass',
        'electric',
        'psychic',
        'ice',
        'dragon',
        'ghost',
        'dark',
        'fighting',
      ],
    },
    width: { control: { type: 'range', min: 80, max: 300, step: 10 } },
  },
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof Platform>;

export const FirePlayer: Story = {
  args: { variant: 'player', typeName: 'fire', width: 200 },
};

export const WaterOpponent: Story = {
  args: { variant: 'opponent', typeName: 'water', width: 170 },
};

export const AllTypes = {
  render: () => {
    const types = [
      'fire',
      'water',
      'grass',
      'electric',
      'psychic',
      'ice',
      'dragon',
      'ghost',
      'dark',
      'fighting',
    ];
    return (
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
        {types.map((t) => (
          <div key={t} className="flex flex-col items-center gap-2">
            <span className="text-xs text-white/50 capitalize">{t}</span>
            <Platform variant="player" typeName={t} width={120} />
          </div>
        ))}
      </div>
    );
  },
};
