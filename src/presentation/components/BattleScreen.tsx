'use client';

import { useState, useCallback } from 'react';
import { useConnectionStore, useBattleStore } from '@/application/stores';
import { useGame } from '@/presentation/providers/GameProvider';
import { useBattle } from '@/application/hooks';
import { BattleScreenView } from './BattleScreenView';

export function BattleScreen() {
  const status = useConnectionStore((s) => s.status);
  const nickname = useConnectionStore((s) => s.nickname);
  const pendingAction = useConnectionStore((s) => s.pendingAction);
  const forcedSwitchPending = useBattleStore((s) => s.forcedSwitchPending);
  const setForcedSwitchPending = useBattleStore(
    (s) => s.setForcedSwitchPending,
  );
  const { socketClient } = useGame();
  const {
    myPlayer,
    opponent,
    isMyTurn,
    lastTurn,
    events,
    attack,
    switchPokemon,
  } = useBattle(socketClient);

  const [notYourTurnCount, setNotYourTurnCount] = useState(0);

  const handleAttack = useCallback(() => {
    if (!isMyTurn) {
      setNotYourTurnCount((c) => c + 1);
      return;
    }
    attack();
  }, [isMyTurn, attack]);

  const handleForcedSwitch = (index: number) => {
    if (index !== myPlayer?.activePokemonIndex) {
      switchPokemon(index);
    }
    setForcedSwitchPending(false);
  };

  return (
    <BattleScreenView
      status={status}
      myNickname={nickname}
      myPlayer={myPlayer}
      opponent={opponent}
      isMyTurn={isMyTurn}
      pendingAction={pendingAction}
      lastTurn={lastTurn}
      events={events}
      forcedSwitchPending={forcedSwitchPending}
      notYourTurnCount={notYourTurnCount}
      onAttack={handleAttack}
      onSwitchPokemon={switchPokemon}
      onForcedSwitch={handleForcedSwitch}
    />
  );
}
