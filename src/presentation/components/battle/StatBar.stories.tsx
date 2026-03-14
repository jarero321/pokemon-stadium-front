import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { StatBar } from './StatBar';

const meta: Meta<typeof StatBar> = {
  title: 'Battle/StatBar (InfoPanel)',
  component: StatBar,
  argTypes: {
    variant: { control: 'select', options: ['player', 'opponent'] },
    hp: { control: { type: 'range', min: 0, max: 200, step: 1 } },
    maxHp: { control: { type: 'range', min: 1, max: 300, step: 1 } },
  },
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof StatBar>;

export const PlayerFull: Story = {
  args: {
    name: 'Charizard',
    types: ['fire', 'flying'],
    hp: 153,
    maxHp: 153,
    attack: 84,
    defense: 78,
    speed: 100,
    variant: 'player',
  },
};

export const OpponentHalf: Story = {
  args: {
    name: 'Blastoise',
    types: ['water'],
    hp: 75,
    maxHp: 150,
    variant: 'opponent',
  },
};

export const CriticalHp: Story = {
  args: {
    name: 'Pikachu',
    types: ['electric'],
    hp: 12,
    maxHp: 90,
    attack: 55,
    defense: 40,
    speed: 90,
    variant: 'player',
  },
};

export const DamageAnimation = {
  name: 'Damage + Ghost Bar',
  render: () => {
    const [hp, setHp] = useState(153);
    return (
      <div className="flex flex-col items-center gap-6">
        <StatBar
          name="Charizard"
          types={['fire', 'flying']}
          hp={hp}
          maxHp={153}
          attack={84}
          defense={78}
          speed={100}
          variant="player"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setHp((h) => Math.max(0, h - 30))}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
          >
            -30 HP
          </button>
          <button
            onClick={() => setHp((h) => Math.max(0, h - 60))}
            className="rounded bg-red-800 px-4 py-2 text-sm text-white hover:bg-red-500"
          >
            -60 HP (Crit!)
          </button>
          <button
            onClick={() => setHp(153)}
            className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-500"
          >
            Full Heal
          </button>
        </div>
      </div>
    );
  },
};

export const SideBySide = {
  name: 'Player vs Opponent',
  render: () => (
    <div className="flex gap-6 flex-wrap justify-center">
      <StatBar
        name="Charizard"
        types={['fire', 'flying']}
        hp={120}
        maxHp={153}
        attack={84}
        defense={78}
        speed={100}
        variant="player"
      />
      <StatBar
        name="Blastoise"
        types={['water']}
        hp={90}
        maxHp={150}
        variant="opponent"
      />
    </div>
  ),
};
