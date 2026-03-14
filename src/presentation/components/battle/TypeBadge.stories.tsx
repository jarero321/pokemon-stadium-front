import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TypeBadge } from '../ui/TypeBadge';

const ALL_TYPES = [
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'ice',
  'dragon',
  'dark',
  'fairy',
  'fighting',
  'poison',
  'ground',
  'rock',
  'bug',
  'ghost',
  'steel',
  'normal',
  'flying',
];

const meta: Meta<typeof TypeBadge> = {
  title: 'Battle/TypeBadge',
  component: TypeBadge,
  argTypes: {
    type: { control: 'select', options: ALL_TYPES },
    iconOnly: { control: 'boolean' },
  },
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof TypeBadge>;

export const Fire: Story = {
  args: { type: 'fire' },
};

export const Water: Story = {
  args: { type: 'water' },
};

export const Compact: Story = {
  args: { type: 'dragon', iconOnly: true },
};

export const AllTypes = {
  name: 'All Types (Full)',
  render: () => (
    <div className="flex flex-wrap gap-3 max-w-lg">
      {ALL_TYPES.map((t) => (
        <TypeBadge key={t} type={t} />
      ))}
    </div>
  ),
};

export const AllTypesIconOnly = {
  name: 'All Types (Icon Only)',
  render: () => (
    <div className="flex flex-wrap gap-2 max-w-sm">
      {ALL_TYPES.map((t) => (
        <TypeBadge key={t} type={t} iconOnly />
      ))}
    </div>
  ),
};

export const DualType = {
  name: 'Dual Type Examples',
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/40 w-20">Charizard</span>
        <TypeBadge type="fire" />
        <TypeBadge type="flying" />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/40 w-20">Gengar</span>
        <TypeBadge type="ghost" />
        <TypeBadge type="poison" />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/40 w-20">Dragonite</span>
        <TypeBadge type="dragon" />
        <TypeBadge type="flying" />
      </div>
    </div>
  ),
};
