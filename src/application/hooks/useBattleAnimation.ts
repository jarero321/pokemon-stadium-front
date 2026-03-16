/* eslint-disable react-hooks/set-state-in-effect, react-hooks/preserve-manual-memoization */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TurnResultDTO, PokemonSwitchDTO } from '@/domain/dtos';
import type { SpriteAnimation } from '@/presentation/components/battle';
import type { BattleMessage } from '@/presentation/components/battle';
import { useBattleStore } from '@/application/stores';
import { useTranslation } from '@/lib/i18n';
import { DURATION } from '@/lib/tokens';
import { FAINT_ANIMATION_BUFFER_MS } from '@/domain/constants';

export interface BattleAnimationState {
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
}

export function useBattleAnimation(
  lastTurn: TurnResultDTO | null,
  lastSwitch: PokemonSwitchDTO | null,
  myNickname: string | null,
  isMyTurn: boolean,
  notYourTurnCount: number,
): BattleAnimationState {
  const { t } = useTranslation();
  const [playerAnim, setPlayerAnim] = useState<SpriteAnimation>('entering');
  const [opponentAnim, setOpponentAnim] = useState<SpriteAnimation>('entering');
  const [playerAnimKey, setPlayerAnimKey] = useState(0);
  const [opponentAnimKey, setOpponentAnimKey] = useState(0);
  const [messages, setMessages] = useState<BattleMessage[]>([]);
  const [messageKey, setMessageKey] = useState(0);
  const setStoreAnimating = useBattleStore((s) => s.setAnimating);
  const [isAnimating, setIsAnimatingLocal] = useState(false);
  const setIsAnimating = useCallback(
    (v: boolean) => {
      setIsAnimatingLocal(v);
      setStoreAnimating(v);
    },
    [setStoreAnimating],
  );

  const processedTurn = useRef<number | null>(null);
  const processedSwitch = useRef<string | null>(null);
  const prevNotYourTurnCount = useRef(0);
  const faintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Callbacks for animation chaining
  const playerAnimNextRef = useRef<(() => void) | null>(null);
  const opponentAnimNextRef = useRef<(() => void) | null>(null);
  const afterMessagesRef = useRef<(() => void) | null>(null);

  // Cleanup faint timer on unmount
  useEffect(() => {
    return () => {
      if (faintTimerRef.current) {
        clearTimeout(faintTimerRef.current);
        faintTimerRef.current = null;
      }
    };
  }, []);

  const onPlayerAnimationEnd = useCallback(() => {
    const next = playerAnimNextRef.current;
    playerAnimNextRef.current = null;
    if (next) next();
    else setPlayerAnim('idle');
  }, []);

  const onOpponentAnimationEnd = useCallback(() => {
    const next = opponentAnimNextRef.current;
    opponentAnimNextRef.current = null;
    if (next) next();
    else setOpponentAnim('idle');
  }, []);

  const onMessageQueueComplete = useCallback(() => {
    const after = afterMessagesRef.current;
    afterMessagesRef.current = null;
    if (after) after();
    else setIsAnimating(false);
  }, []);

  // Process turn results with animation chaining
  useEffect(() => {
    if (!lastTurn || lastTurn.turnNumber === processedTurn.current) return;
    processedTurn.current = lastTurn.turnNumber;

    const isMyAttack = lastTurn.attacker.nickname === myNickname;

    const setAttackerAnim = isMyAttack ? setPlayerAnim : setOpponentAnim;
    const setDefenderAnim = isMyAttack ? setOpponentAnim : setPlayerAnim;
    const bumpAttackerKey = isMyAttack ? setPlayerAnimKey : setOpponentAnimKey;
    const bumpDefenderKey = isMyAttack ? setOpponentAnimKey : setPlayerAnimKey;
    const attackerNextRef = isMyAttack
      ? playerAnimNextRef
      : opponentAnimNextRef;
    const defenderNextRef = isMyAttack
      ? opponentAnimNextRef
      : playerAnimNextRef;

    setIsAnimating(true);

    // Build messages
    const msgs: BattleMessage[] = [
      {
        text: t('battle.attack', { name: lastTurn.attacker.pokemon }),
      },
    ];

    if (lastTurn.typeMultiplier > 1) {
      msgs.push({
        text: t('battle.superEffective', {
          multiplier: lastTurn.typeMultiplier,
        }),
        type: 'super-effective',
      });
    } else if (lastTurn.typeMultiplier < 1 && lastTurn.typeMultiplier > 0) {
      msgs.push({
        text: t('battle.notVeryEffective', {
          multiplier: lastTurn.typeMultiplier,
        }),
        type: 'not-effective',
      });
    }

    msgs.push({
      text: t('battle.tookDamage', {
        name: lastTurn.defender.pokemon,
        damage: lastTurn.damage,
      }),
    });

    if (lastTurn.defeated) {
      msgs.push({
        text: t('battle.fainted', { name: lastTurn.defender.pokemon }),
        type: 'ko',
      });

      if (lastTurn.nextPokemon) {
        msgs.push({
          text: t('battle.switchedTo', {
            player: lastTurn.defender.nickname,
            pokemon: lastTurn.nextPokemon,
          }),
          type: 'info',
        });
      }
    }

    // Start attack animation chain: attacker lunges → defender takes damage → reset
    bumpAttackerKey((k) => k + 1);
    setAttackerAnim('attacking');

    attackerNextRef.current = () => {
      setAttackerAnim('idle');
      bumpDefenderKey((k) => k + 1);
      setDefenderAnim(lastTurn.typeMultiplier > 1 ? 'critical' : 'damage');
    };

    defenderNextRef.current = () => {
      if (lastTurn.defeated) {
        // Faint: bump key so it mounts fresh with fainting animation
        bumpDefenderKey((k) => k + 1);
        setDefenderAnim('fainting');

        // Prevent onAnimationEnd from resetting to idle after faint plays
        // The timeout below handles the post-faint state
        defenderNextRef.current = () => {
          /* no-op: timeout handles post-faint */
        };

        // After faint animation completes
        faintTimerRef.current = setTimeout(
          () => {
            faintTimerRef.current = null;
            defenderNextRef.current = null;
            if (lastTurn.nextPokemon) {
              bumpDefenderKey((k) => k + 1);
              setDefenderAnim('entering');
            } else {
              // No nextPokemon: mark animation done so BattleScreenView hides
              // the defeated Pokemon (defeated + !isAnimating + anim still 'fainting')
              setIsAnimating(false);
            }
          },
          DURATION.fainting * 1000 + FAINT_ANIMATION_BUFFER_MS,
        );
      } else {
        setDefenderAnim('idle');
      }
    };

    // After messages are done, mark animation as complete
    afterMessagesRef.current = () => {
      setIsAnimating(false);
    };

    setMessages(msgs);
    setMessageKey((k) => k + 1);
  }, [lastTurn, myNickname, t]);

  // Pokemon switch animation (entering)
  useEffect(() => {
    if (!lastSwitch) return;
    const switchKey = `${lastSwitch.player}-${lastSwitch.newPokemon}`;
    if (switchKey === processedSwitch.current) return;
    processedSwitch.current = switchKey;

    const isMySwitch = lastSwitch.player === myNickname;
    const setAnim = isMySwitch ? setPlayerAnim : setOpponentAnim;
    const bumpKey = isMySwitch ? setPlayerAnimKey : setOpponentAnimKey;

    bumpKey((k) => k + 1);
    setAnim('entering');

    setMessages([
      {
        text: t('battle.switchedTo', {
          player: lastSwitch.player,
          pokemon: lastSwitch.newPokemon,
        }),
        type: 'info',
      },
    ]);
    setMessageKey((k) => k + 1);
  }, [lastSwitch, myNickname, t]);

  // Not-your-turn feedback
  useEffect(() => {
    if (notYourTurnCount > prevNotYourTurnCount.current) {
      setMessages([{ text: t('battle.notYourTurn'), type: 'info' }]);
      setMessageKey((k) => k + 1);
    }
    prevNotYourTurnCount.current = notYourTurnCount;
  }, [notYourTurnCount, t]);

  return {
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
  };
}
