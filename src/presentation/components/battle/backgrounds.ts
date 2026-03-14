export const STADIUM_BACKGROUNDS = [
  'https://play.pokemonshowdown.com/sprites/gen6bgs/bg-meadow.jpg',
  'https://play.pokemonshowdown.com/sprites/gen6bgs/bg-forest.jpg',
  'https://play.pokemonshowdown.com/sprites/gen6bgs/bg-beach.jpg',
  'https://play.pokemonshowdown.com/sprites/gen6bgs/bg-city.jpg',
  'https://play.pokemonshowdown.com/sprites/gen6bgs/bg-desert.jpg',
  'https://play.pokemonshowdown.com/sprites/gen6bgs/bg-deepsea.jpg',
  'https://play.pokemonshowdown.com/sprites/gen6bgs/bg-icecave.jpg',
  'https://play.pokemonshowdown.com/sprites/gen6bgs/bg-darkbeach.jpg',
  'https://play.pokemonshowdown.com/sprites/gen6bgs/bg-darkcity.jpg',
  'https://play.pokemonshowdown.com/sprites/gen6bgs/bg-darkmeadow.jpg',
  'https://play.pokemonshowdown.com/sprites/gen6bgs/bg-skypillar.jpg',
  'https://play.pokemonshowdown.com/sprites/gen6bgs/bg-elite4drake.jpg',
  'https://play.pokemonshowdown.com/sprites/gen6bgs/bg-leaderwallace.jpg',
];

export function getRandomBackground(): string {
  return STADIUM_BACKGROUNDS[
    Math.floor(Math.random() * STADIUM_BACKGROUNDS.length)
  ];
}
