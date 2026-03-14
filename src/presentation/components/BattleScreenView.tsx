import type { ConnectionStatus } from '@/application/stores';
import type { BattleEvent } from '@/application/stores';
import type { PlayerDTO, PokemonStateDTO, TurnResultDTO } from '@/domain/dtos';
import { useBattleAnimation } from '@/application/hooks';
import { useTranslation } from '@/lib/i18n';
import type { ActionMenuPokemon } from './battle';
import {
  BattleArena,
  BattleActionMenu,
  BattleMessageBox,
  BattleLog,
  BattleLogEntry,
} from './battle';
import { ConnectionDot } from './ui/ConnectionDot';

export interface BattleScreenViewProps {
  status: ConnectionStatus;
  myPlayer: PlayerDTO | null;
  opponent: PlayerDTO | null;
  myNickname: string | null;
  isMyTurn: boolean;
  pendingAction: string | null;
  lastTurn: TurnResultDTO | null;
  events: BattleEvent[];
  forcedSwitchPending: boolean;
  notYourTurnCount: number;
  onAttack: () => void;
  onSwitchPokemon: (index: number) => void;
  onForcedSwitch: (index: number) => void;
}

/* ── Data mappers ── */

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

/* ── Component ── */

export function BattleScreenView({
  status,
  myPlayer,
  opponent,
  myNickname,
  isMyTurn,
  pendingAction,
  lastTurn,
  events,
  forcedSwitchPending,
  notYourTurnCount,
  onAttack,
  onSwitchPokemon,
  onForcedSwitch,
}: BattleScreenViewProps) {
  const { t } = useTranslation();
  const myActive = myPlayer?.team?.[myPlayer.activePokemonIndex] ?? null;
  const opponentActive = opponent?.team?.[opponent.activePokemonIndex] ?? null;

  const {
    playerAnim,
    opponentAnim,
    playerAnimKey,
    opponentAnimKey,
    messages,
    messageKey,
  } = useBattleAnimation(lastTurn, myNickname, isMyTurn, notYourTurnCount);

  const handleSwitch = (pokemonIndex: number) => {
    if (forcedSwitchPending) {
      onForcedSwitch(pokemonIndex);
    } else {
      onSwitchPokemon(pokemonIndex);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      {/* Connection warning */}
      {status !== 'connected' && (
        <div className="w-full max-w-2xl">
          <ConnectionDot status={status} />
        </div>
      )}

      {/* Battle Arena */}
      <div className="w-full max-w-2xl">
        <BattleArena
          playerPokemon={myActive ? toArenaPokemon(myActive) : null}
          opponentPokemon={
            opponentActive ? toArenaPokemon(opponentActive) : null
          }
          playerAnimation={playerAnim}
          opponentAnimation={opponentAnim}
          playerAnimKey={playerAnimKey}
          opponentAnimKey={opponentAnimKey}
        />
      </div>

      {/* Battle HUD: Turn bar + Message Box + Action Menu */}
      <div
        className={`battle-hud w-full max-w-2xl transition-colors duration-300 ${
          isMyTurn ? 'border-green-500/30' : 'border-yellow-500/20'
        }`}
      >
        {/* Turn status bar (integrated header) */}
        <div
          className={`col-span-full flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors duration-300 ${
            isMyTurn
              ? 'bg-green-500/[0.06] text-green-400/80'
              : 'bg-yellow-500/[0.04] text-yellow-400/60'
          }`}
        >
          <span
            className={`block h-1.5 w-1.5 rounded-full bg-current ${
              isMyTurn ? 'animate-[dot-blink_1s_step-start_infinite]' : ''
            }`}
          />
          {isMyTurn ? t('battle.yourTurn') : t('battle.opponentTurn')}
        </div>

        {/* Content row: message + divider + actions */}
        <BattleMessageBox messages={messages} messageKey={messageKey} />

        <div className="h-full bg-white/10" />

        <BattleActionMenu
          disabled={!isMyTurn || !!pendingAction}
          forcedSwitch={forcedSwitchPending}
          onAttack={onAttack}
          onSwitch={handleSwitch}
          team={myPlayer?.team ? toActionMenuTeam(myPlayer.team) : undefined}
          activePokemonIndex={myPlayer?.activePokemonIndex}
        />
      </div>

      {/* Battle Log (secondary, collapsible) */}
      <BattleLog
        title={`Battle Log (${events.length} events)`}
        className="w-full max-w-2xl"
      >
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {events.length === 0 && (
            <BattleLogEntry>{t('battle.battleStarted')}</BattleLogEntry>
          )}
          {events.map((evt, i) => (
            <BattleLogEntry key={i}>
              {evt.type === 'turn_result' && (
                <span className="text-white/70">
                  <strong>{evt.data.attacker.nickname}</strong>&apos;s{' '}
                  {evt.data.attacker.pokemon} dealt{' '}
                  <strong>{evt.data.damage}</strong> damage to{' '}
                  {evt.data.defender.pokemon}
                  {evt.data.typeMultiplier > 1 && (
                    <span className="text-neon-warning">
                      {' '}
                      (x{evt.data.typeMultiplier} super effective!)
                    </span>
                  )}
                  {evt.data.typeMultiplier < 1 && (
                    <span className="text-neon-player">
                      {' '}
                      (x{evt.data.typeMultiplier} not very effective)
                    </span>
                  )}
                  {evt.data.defeated && (
                    <span className="text-neon-danger">
                      {' '}
                      — {t('battle.ko')}
                    </span>
                  )}
                </span>
              )}
              {evt.type === 'pokemon_defeated' && (
                <span className="text-neon-danger">
                  {evt.data.owner}&apos;s {evt.data.pokemon} was defeated!
                  {evt.data.remainingTeam > 0
                    ? ` (${t('battle.remaining', { count: evt.data.remainingTeam })})`
                    : ` (${t('battle.noLeft')})`}
                </span>
              )}
              {evt.type === 'pokemon_switch' && (
                <span className="text-neon-player">
                  {t('battle.switchedTo', {
                    player: evt.data.player,
                    pokemon: evt.data.newPokemon,
                  })}{' '}
                  ({evt.data.newPokemonHp}/{evt.data.newPokemonMaxHp} HP)
                </span>
              )}
              {evt.type === 'battle_end' && (
                <span className="text-neon-warning font-extrabold">
                  {t('battle.battleEnded', { winner: evt.data.winner })}
                  {evt.data.reason && ` (${evt.data.reason})`}
                </span>
              )}
            </BattleLogEntry>
          ))}
        </div>
      </BattleLog>
    </div>
  );
}
