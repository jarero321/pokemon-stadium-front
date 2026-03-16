'use client';

import { useMemo } from 'react';
import { PokemonSprite } from './PokemonSprite';
import { Platform } from './Platform';
import { StatBar } from './StatBar';
import { AttackEffect } from './AttackEffect';
import { getRandomBackground } from './backgrounds';
import type { SpriteAnimation } from './PokemonSprite';
import type { BattlePokemon } from './types';

type ArenaPokemon = Partial<
  Pick<BattlePokemon, 'attack' | 'defense' | 'speed'>
> &
  Omit<BattlePokemon, 'attack' | 'defense' | 'speed'>;

interface BattleArenaProps {
  playerPokemon: ArenaPokemon | null;
  opponentPokemon: ArenaPokemon | null;
  playerAnimation?: SpriteAnimation;
  opponentAnimation?: SpriteAnimation;
  playerAnimKey?: number;
  opponentAnimKey?: number;
  background?: string;
  onPlayerAnimationEnd?: () => void;
  onOpponentAnimationEnd?: () => void;
}

export function BattleArena({
  playerPokemon,
  opponentPokemon,
  playerAnimation = 'idle',
  opponentAnimation = 'idle',
  playerAnimKey = 0,
  opponentAnimKey = 0,
  background,
  onPlayerAnimationEnd,
  onOpponentAnimationEnd,
}: BattleArenaProps) {
  const bg = useMemo(() => background ?? getRandomBackground(), [background]);

  return (
    <div className="battle-arena" role="region" aria-label="Battle arena">
      {/* Background image */}
      <div
        className="battle-arena__bg"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Dark overlay for readability */}
      <div className="battle-arena__overlay" />

      {/* Opponent side (top-right) */}
      <div className="battle-arena__opponent-zone">
        {opponentPokemon && (
          <>
            <StatBar
              name={opponentPokemon.name}
              types={opponentPokemon.types}
              hp={opponentPokemon.hp}
              maxHp={opponentPokemon.maxHp}
              variant="opponent"
            />
            <div className="battle-arena__sprite-stack relative">
              <PokemonSprite
                key={opponentPokemon.name}
                name={opponentPokemon.name}
                back={false}
                size={176}
                animation={opponentAnimation}
                animationKey={opponentAnimKey}
                onAnimationEnd={onOpponentAnimationEnd}
              />
              <Platform
                variant="opponent"
                typeName={opponentPokemon.types[0]}
                width={220}
              />
              {/* Attack effect on opponent — uses player's types */}
              {playerPokemon && (
                <AttackEffect
                  types={playerPokemon.types}
                  trigger={opponentAnimation === 'damage' ? opponentAnimKey : 0}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Player side (bottom-left) */}
      <div className="battle-arena__player-zone">
        {playerPokemon && (
          <>
            <div className="battle-arena__sprite-stack relative">
              <PokemonSprite
                key={playerPokemon.name}
                name={playerPokemon.name}
                back={true}
                size={288}
                animation={playerAnimation}
                animationKey={playerAnimKey}
                onAnimationEnd={onPlayerAnimationEnd}
              />
              <Platform
                variant="player"
                typeName={playerPokemon.types[0]}
                width={360}
              />
              {/* Attack effect on player — uses opponent's types */}
              {opponentPokemon && (
                <AttackEffect
                  types={opponentPokemon.types}
                  trigger={playerAnimation === 'damage' ? playerAnimKey : 0}
                />
              )}
            </div>
            <StatBar
              name={playerPokemon.name}
              types={playerPokemon.types}
              hp={playerPokemon.hp}
              maxHp={playerPokemon.maxHp}
              attack={playerPokemon.attack}
              defense={playerPokemon.defense}
              speed={playerPokemon.speed}
              variant="player"
            />
          </>
        )}
      </div>
    </div>
  );
}
