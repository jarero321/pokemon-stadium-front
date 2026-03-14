import { useEffect, useRef, useState } from 'react';
import type { TurnResultDTO } from '@/domain/dtos';
import type { SpriteAnimation } from '@/presentation/components/battle';
import type { BattleMessage } from '@/presentation/components/battle';
import { useTranslation } from '@/lib/i18n';

export interface BattleAnimationState {
  playerAnim: SpriteAnimation;
  opponentAnim: SpriteAnimation;
  playerAnimKey: number;
  opponentAnimKey: number;
  messages: BattleMessage[];
  messageKey: number;
}

const EMPTY_MESSAGES: BattleMessage[] = [];

export function useBattleAnimation(
  lastTurn: TurnResultDTO | null,
  myNickname: string | null,
  isMyTurn: boolean,
  notYourTurnCount: number,
): BattleAnimationState {
  const { t } = useTranslation();
  const [playerAnim, setPlayerAnim] = useState<SpriteAnimation>('idle');
  const [opponentAnim, setOpponentAnim] = useState<SpriteAnimation>('idle');
  const [playerAnimKey, setPlayerAnimKey] = useState(0);
  const [opponentAnimKey, setOpponentAnimKey] = useState(0);
  const [messages, setMessages] = useState<BattleMessage[]>(EMPTY_MESSAGES);
  const [messageKey, setMessageKey] = useState(0);
  const processedTurn = useRef<number | null>(null);
  const prevIsMyTurn = useRef<boolean | null>(null);
  const prevNotYourTurnCount = useRef(0);

  // Turn result messages
  useEffect(() => {
    if (!lastTurn || lastTurn.turnNumber === processedTurn.current) return;
    processedTurn.current = lastTurn.turnNumber;

    const msgs: BattleMessage[] = [
      {
        text: t('battle.attack', { name: lastTurn.attacker.pokemon }),
        type: 'normal',
      },
    ];

    if (lastTurn.typeMultiplier > 1) {
      msgs.push({
        text: t('battle.superEffective', {
          multiplier: lastTurn.typeMultiplier,
        }),
        type: 'super-effective',
      });
    } else if (lastTurn.typeMultiplier < 1) {
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
      type: 'normal',
    });

    if (lastTurn.defeated) {
      msgs.push({
        text: t('battle.fainted', { name: lastTurn.defender.pokemon }),
        type: 'ko',
      });
    }

    /* eslint-disable react-hooks/set-state-in-effect -- queued messages driven by external turn events */
    setMessages(msgs);
    setMessageKey((k) => k + 1);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [lastTurn, t]);

  // Turn change messages
  useEffect(() => {
    if (prevIsMyTurn.current === null) {
      prevIsMyTurn.current = isMyTurn;
      return;
    }
    if (prevIsMyTurn.current !== isMyTurn) {
      prevIsMyTurn.current = isMyTurn;
      const msg: BattleMessage = isMyTurn
        ? { text: t('battle.yourTurn'), type: 'info' }
        : { text: t('battle.opponentTurn'), type: 'info' };
      /* eslint-disable react-hooks/set-state-in-effect -- turn change notification */
      setMessages([msg]);
      setMessageKey((k) => k + 1);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [isMyTurn, t]);

  // Not your turn messages
  useEffect(() => {
    if (notYourTurnCount > prevNotYourTurnCount.current) {
      /* eslint-disable react-hooks/set-state-in-effect -- feedback for invalid action */
      setMessages([{ text: t('battle.notYourTurn'), type: 'info' }]);
      setMessageKey((k) => k + 1);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    prevNotYourTurnCount.current = notYourTurnCount;
  }, [notYourTurnCount, t]);

  // Sprite animations
  useEffect(() => {
    if (!lastTurn || lastTurn.turnNumber === processedTurn.current) return;

    const isMyAttack = lastTurn.attacker.nickname === myNickname;
    const setAttacker = isMyAttack ? setPlayerAnim : setOpponentAnim;
    const setDefender = isMyAttack ? setOpponentAnim : setPlayerAnim;
    const bumpAttackerKey = isMyAttack ? setPlayerAnimKey : setOpponentAnimKey;
    const bumpDefenderKey = isMyAttack ? setOpponentAnimKey : setPlayerAnimKey;

    const attackTimer = setTimeout(() => {
      setAttacker('attacking');
      bumpAttackerKey((k) => k + 1);
    }, 0);

    const damageTimer = setTimeout(() => {
      setDefender('damage');
      bumpDefenderKey((k) => k + 1);
    }, 400);

    const resetTimer = setTimeout(() => {
      setAttacker('idle');
      if (lastTurn.defeated) {
        setDefender('fainting');
        bumpDefenderKey((k) => k + 1);
      } else {
        setDefender('idle');
      }
    }, 900);

    return () => {
      clearTimeout(attackTimer);
      clearTimeout(damageTimer);
      clearTimeout(resetTimer);
    };
  }, [lastTurn, myNickname]);

  return {
    playerAnim,
    opponentAnim,
    playerAnimKey,
    opponentAnimKey,
    messages,
    messageKey,
  };
}
