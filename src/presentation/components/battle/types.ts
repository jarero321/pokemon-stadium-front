export interface BattlePokemon {
  name: string;
  types: string[];
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
}

export { getTypeColor } from '@/lib/tokens';

export function getSpriteUrl(name: string, back = false): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const dir = back ? 'ani-back' : 'ani';
  return `https://play.pokemonshowdown.com/sprites/${dir}/${slug}.gif`;
}
