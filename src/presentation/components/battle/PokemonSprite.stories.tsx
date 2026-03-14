import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { PokemonSprite } from './PokemonSprite';
import type { SpriteAnimation } from './PokemonSprite';

const meta: Meta<typeof PokemonSprite> = {
  title: 'Battle/PokemonSprite',
  component: PokemonSprite,
  argTypes: {
    name: {
      control: 'select',
      options: [
        'charizard',
        'blastoise',
        'venusaur',
        'pikachu',
        'gengar',
        'mewtwo',
        'gyarados',
        'dragonite',
      ],
    },
    back: { control: 'boolean' },
    size: { control: { type: 'range', min: 64, max: 256, step: 16 } },
    animation: {
      control: 'select',
      options: ['idle', 'entering', 'damage', 'fainting'],
    },
  },
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof PokemonSprite>;

export const FrontSprite: Story = {
  args: { name: 'charizard', size: 128, animation: 'idle' },
};

export const BackSprite: Story = {
  args: { name: 'charizard', back: true, size: 140, animation: 'idle' },
};

export const AllAnimations = {
  name: 'Animation Playground',
  render: () => {
    const [anim, setAnim] = useState<SpriteAnimation>('idle');
    const [animKey, setAnimKey] = useState(0);
    const [pokemon, setPokemon] = useState('charizard');
    const [back, setBack] = useState(false);
    const pokemons = [
      'charizard',
      'blastoise',
      'venusaur',
      'pikachu',
      'gengar',
      'mewtwo',
      'gyarados',
      'dragonite',
    ];

    const triggerAnim = (a: SpriteAnimation) => {
      setAnim(a);
      setAnimKey((k) => k + 1);
    };

    return (
      <div className="flex flex-col items-center gap-6">
        <div className="h-52 w-52 flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
          <PokemonSprite
            name={pokemon}
            back={back}
            size={160}
            animation={anim}
            animationKey={animKey}
            onAnimationEnd={() => setAnim('idle')}
          />
        </div>

        <div className="flex flex-col gap-3 items-center">
          {/* Animation buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => triggerAnim('entering')}
              className="rounded bg-yellow-600 px-3 py-2 text-xs font-semibold text-white hover:bg-yellow-500"
            >
              Entry
            </button>
            <button
              onClick={() => triggerAnim('damage')}
              className="rounded bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500"
            >
              Damage
            </button>
            <button
              onClick={() => triggerAnim('fainting')}
              className="rounded bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-500"
            >
              Faint
            </button>
            <button
              onClick={() => setBack((b) => !b)}
              className="rounded bg-gray-600 px-3 py-2 text-xs text-white hover:bg-gray-500"
            >
              {back ? 'Show Front' : 'Show Back'}
            </button>
          </div>

          {/* Pokemon selector */}
          <div className="flex gap-1 flex-wrap justify-center max-w-sm">
            {pokemons.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPokemon(p);
                  triggerAnim('entering');
                }}
                className={`rounded px-3 py-1 text-xs capitalize ${
                  pokemon === p
                    ? 'bg-blue-500/30 text-blue-400'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

export const DamageSequence = {
  name: 'Repeated Damage Hits',
  render: () => {
    const [animKey, setAnimKey] = useState(0);
    const [anim, setAnim] = useState<SpriteAnimation>('idle');
    const [hits, setHits] = useState(0);

    const hit = () => {
      setAnimKey((k) => k + 1);
      setAnim('damage');
      setHits((h) => h + 1);
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="h-48 w-48 flex items-center justify-center">
          <PokemonSprite
            name="pikachu"
            size={140}
            animation={anim}
            animationKey={animKey}
            onAnimationEnd={() => setAnim('idle')}
          />
        </div>
        <button
          onClick={hit}
          className="rounded bg-red-600 px-6 py-2 text-sm font-bold text-white hover:bg-red-500"
        >
          Hit! ({hits} hits)
        </button>
      </div>
    );
  },
};
