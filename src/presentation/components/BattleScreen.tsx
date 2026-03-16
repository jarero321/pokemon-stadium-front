'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useConnectionStore, useBattleStore } from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import {
  useBattle,
  useBattleAnimation,
  useCountdown,
  useLeaveGame,
} from '@/application/hooks';
import { BattleScreenView } from './BattleScreenView';
import { TURN_TIMEOUT_SECONDS } from '@/domain/constants';

export function BattleScreen() {
  const status = useConnectionStore((s) => s.status);
  const nickname = useConnectionStore((s) => s.nickname);
  const pendingAction = useConnectionStore((s) => s.pendingAction);
  const forcedSwitchPending = useBattleStore((s) => s.forcedSwitchPending);
  const setForcedSwitchPending = useBattleStore(
    (s) => s.setForcedSwitchPending,
  );
  const animating = useBattleStore((s) => s.animating);
  const { socketClient } = useGame();
  const leaveGame = useLeaveGame();
  const {
    myPlayer,
    opponent,
    isMyTurn,
    lastTurn,
    lastSwitch,
    attack,
    switchPokemon,
  } = useBattle(socketClient);

  const [notYourTurnCount, setNotYourTurnCount] = useState(0);

  // Auto-attack when turn timer expires
  const handleTimerExpire = useCallback(() => {
    if (isMyTurn && !pendingAction && !animating) {
      attack();
    }
  }, [isMyTurn, pendingAction, animating, attack]);

  const {
    start: startTimer,
    stop: stopTimer,
    ...timerState
  } = useCountdown({
    seconds: TURN_TIMEOUT_SECONDS,
    onExpire: handleTimerExpire,
  });

  // Start/stop timer based on turn
  useEffect(() => {
    if (isMyTurn && !animating && !forcedSwitchPending) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [isMyTurn, animating, forcedSwitchPending, startTimer, stopTimer]);

  const handleAttack = useCallback(() => {
    if (!isMyTurn) {
      setNotYourTurnCount((c) => c + 1);
      return;
    }
    stopTimer();
    attack();
  }, [isMyTurn, attack, stopTimer]);

  const handleSwitch = useCallback(
    (index: number) => {
      stopTimer();
      switchPokemon(index);
    },
    [switchPokemon, stopTimer],
  );

  const handleForcedSwitch = useCallback(
    (index: number) => {
      if (index !== myPlayer?.activePokemonIndex) {
        switchPokemon(index);
      }
      setForcedSwitchPending(false);
    },
    [myPlayer?.activePokemonIndex, switchPokemon, setForcedSwitchPending],
  );

  const animation = useBattleAnimation(
    lastTurn,
    lastSwitch,
    nickname,
    isMyTurn,
    notYourTurnCount,
  );

  const turnTimerProps = useMemo(
    () =>
      isMyTurn && !animating && timerState.active
        ? { remaining: timerState.remaining, progress: timerState.progress }
        : null,
    [
      isMyTurn,
      animating,
      timerState.active,
      timerState.remaining,
      timerState.progress,
    ],
  );

  // Don't show forced switch if player has no alive alternatives
  const hasAliveAlternatives =
    myPlayer?.team?.some(
      (p, i) => !p.defeated && i !== myPlayer.activePokemonIndex,
    ) ?? false;

  return (
    <BattleScreenView
      status={status}
      myPlayer={myPlayer}
      opponent={opponent}
      isMyTurn={isMyTurn}
      pendingAction={pendingAction}
      forcedSwitchPending={forcedSwitchPending && hasAliveAlternatives}
      playerAnim={animation.playerAnim}
      opponentAnim={animation.opponentAnim}
      playerAnimKey={animation.playerAnimKey}
      opponentAnimKey={animation.opponentAnimKey}
      messages={animation.messages}
      messageKey={animation.messageKey}
      isAnimating={animation.isAnimating}
      onPlayerAnimationEnd={animation.onPlayerAnimationEnd}
      onOpponentAnimationEnd={animation.onOpponentAnimationEnd}
      onMessageQueueComplete={animation.onMessageQueueComplete}
      onAttack={handleAttack}
      onSwitchPokemon={handleSwitch}
      onForcedSwitch={handleForcedSwitch}
      onSurrender={leaveGame}
      turnTimer={turnTimerProps}
    />
  );
}
