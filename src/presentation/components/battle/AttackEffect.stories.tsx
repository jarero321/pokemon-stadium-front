import type { Meta } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { AttackEffect } from './AttackEffect';
import { PokemonSprite } from './PokemonSprite';

const meta: Meta<typeof AttackEffect> = {
  title: 'Battle/AttackEffect',
  component: AttackEffect,
  parameters: { layout: 'centered' },
};

export default meta;

const EFFECT_MAP: { label: string; types: string[] }[] = [
  { label: 'Blaze (fire)', types: ['fire'] },
  { label: 'Blaze (dragon)', types: ['dragon'] },
  { label: 'Aqua (water)', types: ['water'] },
  { label: 'Aqua (ice)', types: ['ice'] },
  { label: 'Bolt (electric)', types: ['electric'] },
  { label: 'Mystic (psychic)', types: ['psychic'] },
  { label: 'Mystic (ghost)', types: ['ghost'] },
  { label: 'Mystic (dark)', types: ['dark'] },
  { label: 'Strike (fighting)', types: ['fighting'] },
  { label: 'Strike (rock)', types: ['rock'] },
  { label: 'Strike (normal)', types: ['normal'] },
];

export const AllEffects = {
  name: 'All Effects Gallery',
  render: () => {
    const [triggers, setTriggers] = useState<number[]>(EFFECT_MAP.map(() => 0));

    const fire = (idx: number) => {
      setTriggers((prev) => {
        const next = [...prev];
        next[idx]++;
        return next;
      });
    };

    return (
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {EFFECT_MAP.map((fx, i) => (
          <div key={fx.label} className="flex flex-col items-center gap-2">
            <span className="text-[10px] text-white/50 uppercase tracking-wider">
              {fx.label}
            </span>
            <div
              className="relative w-32 h-32 bg-black/50 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={() => fire(i)}
            >
              <span className="text-white/20 text-xs">Click</span>
              <AttackEffect types={fx.types} trigger={triggers[i]} />
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const OnPokemon = {
  name: 'Attack on Pokemon',
  render: () => {
    const [trigger, setTrigger] = useState(0);
    const [selectedType, setSelectedType] = useState('fire');
    const types = [
      'fire',
      'water',
      'electric',
      'psychic',
      'fighting',
      'dragon',
      'ghost',
      'ice',
      'dark',
      'normal',
    ];

    return (
      <div className="flex flex-col items-center gap-6">
        <div className="relative" style={{ width: 180, height: 180 }}>
          <PokemonSprite
            name="charizard"
            back={false}
            size={180}
            animation={trigger > 0 ? 'damage' : 'idle'}
            animationKey={trigger}
          />
          <AttackEffect types={[selectedType]} trigger={trigger} />
        </div>
        <div className="flex flex-wrap gap-2 justify-center max-w-sm">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => {
                setSelectedType(t);
                setTrigger((k) => k + 1);
              }}
              className={`type-badge ${t === selectedType ? 'ring-2 ring-white' : ''}`}
              data-type={t}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    );
  },
};

export const RandomDualType = {
  name: 'Random from Dual Type',
  render: () => {
    const [trigger, setTrigger] = useState(0);
    const dualTypes = ['fire', 'flying'];

    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-xs text-white/40">
          Charizard (fire/flying) — each click picks a random type for the
          effect
        </p>
        <div className="relative" style={{ width: 160, height: 160 }}>
          <PokemonSprite
            name="blastoise"
            back={false}
            size={160}
            animation={trigger > 0 ? 'damage' : 'idle'}
            animationKey={trigger}
          />
          <AttackEffect types={dualTypes} trigger={trigger} />
        </div>
        <button
          onClick={() => setTrigger((k) => k + 1)}
          className="battle-btn battle-btn--attack max-w-xs"
        >
          Charizard Attacks!
        </button>
      </div>
    );
  },
};
