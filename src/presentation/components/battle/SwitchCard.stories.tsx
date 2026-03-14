import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SwitchCard } from './SwitchCard';

const meta: Meta<typeof SwitchCard> = {
  title: 'Battle/SwitchCard',
  component: SwitchCard,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SwitchCard>;

export const Default: Story = {
  args: {
    pokemon: { name: 'Charizard', hp: 153, maxHp: 153, defeated: false },
  },
};

export const LowHp: Story = {
  args: {
    pokemon: { name: 'Pikachu', hp: 12, maxHp: 90, defeated: false },
  },
};

export const Active: Story = {
  args: {
    pokemon: { name: 'Gengar', hp: 80, maxHp: 120, defeated: false },
    isActive: true,
    badge: 'IN',
  },
};

export const Fainted: Story = {
  args: {
    pokemon: { name: 'Dragonite', hp: 0, maxHp: 182, defeated: true },
    canSelect: false,
  },
};

export const Readonly: Story = {
  args: {
    pokemon: { name: 'Blastoise', hp: 120, maxHp: 150, defeated: false },
    readonly: true,
    isActive: true,
  },
};

export const TeamList = {
  render: () => {
    const team = [
      { name: 'Charizard', hp: 153, maxHp: 153, defeated: false },
      { name: 'Gengar', hp: 45, maxHp: 120, defeated: false },
      { name: 'Dragonite', hp: 0, maxHp: 182, defeated: true },
    ];

    return (
      <div className="flex flex-col gap-1">
        {team.map((p, i) => (
          <SwitchCard
            key={i}
            pokemon={p}
            isActive={i === 0}
            canSelect={!p.defeated && i !== 0}
            badge={i === 0 ? 'IN' : undefined}
            onClick={() => alert(`Switch to ${p.name}`)}
          />
        ))}
      </div>
    );
  },
};
