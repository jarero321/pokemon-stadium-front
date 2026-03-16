import type { ConnectionStatus } from '@/application/stores';
import type { PlayerDTO, PokemonStateDTO } from '@/domain/dtos';
import { useTranslation } from '@/lib/i18n';
import type {
  SpriteAnimation,
  BattleMessage,
  ActionMenuPokemon,
} from './battle';
import { BattleArena, BattleActionMenu, BattleMessageBox } from './battle';
import { ConnectionDot } from './ui/ConnectionDot';
import { CountdownRing } from './ui/CountdownRing';

export interface BattleScreenViewProps {
  status: ConnectionStatus;
  myPlayer: PlayerDTO | null;
  opponent: PlayerDTO | null;
  isMyTurn: boolean;
  pendingAction: string | null;
  forcedSwitchPending: boolean;
  playerAnim: SpriteAnimation;
  opponentAnim: SpriteAnimation;
  playerAnimKey: number;
  opponentAnimKey: number;
  messages: BattleMessage[];
  messageKey: number;
  isAnimating: boolean;
  onPlayerAnimationEnd: () => void;
  onOpponentAnimationEnd: () => void;
  onMessageQueueComplete: () => void;
  onAttack: () => void;
  onSwitchPokemon: (index: number) => void;
  onForcedSwitch: (index: number) => void;
  onSurrender: () => void;
  turnTimer: { remaining: number; progress: number } | null;
}

function toArenaPokemon(dto: PokemonStateDTO) {
  return { name: dto.name, types: dto.type, hp: dto.hp, maxHp: dto.maxHp };
}

function toActionMenuTeam(team: PokemonStateDTO[]): ActionMenuPokemon[] {
  return team.map((p) => ({
    name: p.name,
    hp: p.hp,
    maxHp: p.maxHp,
    types: p.type,
    defeated: p.defeated,
  }));
}

export function BattleScreenView({
  status,
  myPlayer,
  opponent,
  isMyTurn,
  pendingAction,
  forcedSwitchPending,
  playerAnim,
  opponentAnim,
  playerAnimKey,
  opponentAnimKey,
  messages,
  messageKey,
  isAnimating,
  onPlayerAnimationEnd,
  onOpponentAnimationEnd,
  onMessageQueueComplete,
  onAttack,
  onSwitchPokemon,
  onForcedSwitch,
  onSurrender,
  turnTimer,
}: BattleScreenViewProps) {
  const { t } = useTranslation();

  const myActiveRaw = myPlayer?.team?.[myPlayer.activePokemonIndex] ?? null;
  const opponentActiveRaw =
    opponent?.team?.[opponent.activePokemonIndex] ?? null;

  // Hide defeated Pokemon only AFTER animation chain + faint timeout completes
  const myActive = myActiveRaw?.defeated && !isAnimating ? null : myActiveRaw;
  const opponentActive =
    opponentActiveRaw?.defeated && !isAnimating ? null : opponentActiveRaw;

  const handleSwitch = (pokemonIndex: number) => {
    if (forcedSwitchPending) {
      onForcedSwitch(pokemonIndex);
    } else {
      onSwitchPokemon(pokemonIndex);
    }
  };

  const isActionsDisabled = !isMyTurn || !!pendingAction || isAnimating;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      {/* Connection warning */}
      {status !== 'connected' && (
        <div className="px-4 pt-2">
          <ConnectionDot status={status} />
        </div>
      )}

      {/* Arena — fills available space, edge-to-edge on mobile */}
      <BattleArena
        playerPokemon={myActive ? toArenaPokemon(myActive) : null}
        opponentPokemon={opponentActive ? toArenaPokemon(opponentActive) : null}
        playerAnimation={playerAnim}
        opponentAnimation={opponentAnim}
        playerAnimKey={playerAnimKey}
        opponentAnimKey={opponentAnimKey}
        onPlayerAnimationEnd={onPlayerAnimationEnd}
        onOpponentAnimationEnd={onOpponentAnimationEnd}
      />

      {/* HUD — sticky bottom like Pokemon games */}
      <div className="border-t border-[#1e2940] bg-[#080c14]/95 backdrop-blur-md safe-bottom">
        {/* Turn bar */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            isMyTurn && !isAnimating
              ? 'bg-violet-500/[0.06] text-violet-400/80'
              : 'bg-[#080c14] text-[#475569]'
          }`}
        >
          {turnTimer && (
            <CountdownRing
              remaining={turnTimer.remaining}
              progress={turnTimer.progress}
              size={28}
              urgent
            />
          )}
          <span
            className={`${
              isMyTurn && !isAnimating
                ? 'animate-[dot-blink_1s_step-start_infinite]'
                : ''
            } mr-1 inline-block h-1.5 w-1.5 rounded-full ${isMyTurn && !isAnimating ? 'bg-violet-400' : 'bg-white/30'}`}
          />
          {isAnimating
            ? ''
            : forcedSwitchPending
              ? t('battle.chooseNext')
              : isMyTurn
                ? t('battle.yourTurn')
                : t('battle.opponentTurn')}
          <button
            onClick={onSurrender}
            className="ml-auto text-[9px] text-[#475569]/70 transition hover:text-rose-400/70"
          >
            {t('battle.surrender')}
          </button>
        </div>

        {/* Message + Actions row */}
        <div className="battle-hud border-0 rounded-none">
          <BattleMessageBox
            messages={messages}
            messageKey={messageKey}
            onQueueComplete={onMessageQueueComplete}
          />
          <div className="battle-hud__divider" />
          <BattleActionMenu
            disabled={isActionsDisabled}
            forcedSwitch={forcedSwitchPending}
            onAttack={onAttack}
            onSwitch={handleSwitch}
            team={myPlayer?.team ? toActionMenuTeam(myPlayer.team) : undefined}
            activePokemonIndex={myPlayer?.activePokemonIndex}
          />
        </div>
      </div>
    </div>
  );
}
