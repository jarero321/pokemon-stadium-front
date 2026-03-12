'use client';

import { useEffect } from 'react';
import {
  useConnectionStore,
  useLobbyStore,
  useBattleStore,
  useViewStore,
} from '@/application/stores';
import { LobbyStatus } from '@/domain/enums';

export function useViewSync() {
  const nickname = useConnectionStore((s) => s.nickname);
  const lobby = useLobbyStore((s) => s.lobby);
  const myPlayer = useLobbyStore((s) => s.getMyPlayer());
  const started = useBattleStore((s) => s.started);
  const finished = useBattleStore((s) => s.finished);
  const setView = useViewStore((s) => s.setView);

  useEffect(() => {
    if (finished) {
      setView('result');
      return;
    }

    if (started || lobby?.status === LobbyStatus.BATTLING) {
      setView('battle');
      return;
    }

    if (!nickname) {
      setView('nickname');
      return;
    }

    if (lobby?.status === LobbyStatus.FINISHED) {
      setView('result');
      return;
    }

    if (!lobby) {
      setView('lobby');
      return;
    }

    const hasTeam = myPlayer?.team && myPlayer.team.length > 0;

    if (hasTeam) {
      setView('ready');
      return;
    }

    setView('lobby');
  }, [nickname, lobby, myPlayer, started, finished, setView]);
}
