import type { TeamPokemon } from './battle/VictoryOverlay';
import { VictoryOverlay } from './battle';

export interface ResultScreenViewProps {
  winner: string | null;
  nickname: string | null;
  totalTurns: number;
  totalKOs: number;
  totalDamage: number;
  reason: string | null;
  lastPokemonName: string | null;
  lastPokemonSprite: string | null;
  lastPokemonTypes: string[] | null;
  onPlayAgain: () => void;
  onExit: () => void;
  myTeam?: TeamPokemon[];
  opponentTeam?: TeamPokemon[];
  myName?: string;
  opponentName?: string;
}

export function ResultScreenView({
  winner,
  nickname,
  totalTurns,
  totalKOs,
  totalDamage,
  reason,
  lastPokemonName,
  lastPokemonSprite,
  lastPokemonTypes,
  onPlayAgain,
  onExit,
  myTeam,
  opponentTeam,
  myName,
  opponentName,
}: ResultScreenViewProps) {
  const isWinner = winner === nickname;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <VictoryOverlay
        isVisible
        isVictory={isWinner}
        winnerName={winner ?? ''}
        pokemonSprite={lastPokemonSprite ?? undefined}
        pokemonName={lastPokemonName ?? undefined}
        pokemonTypes={lastPokemonTypes ?? undefined}
        totalTurns={totalTurns}
        totalKOs={totalKOs}
        totalDamage={totalDamage}
        reason={reason ?? undefined}
        onPlayAgain={onPlayAgain}
        onExit={onExit}
        myTeam={myTeam}
        opponentTeam={opponentTeam}
        myName={myName}
        opponentName={opponentName}
      />
    </div>
  );
}
