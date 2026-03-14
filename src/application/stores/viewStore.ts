import { useConnectionStore } from './connectionStore';
import { useLobbyStore } from './lobbyStore';
import { useBattleStore } from './battleStore';
import { LobbyStatus } from '@/domain/enums';

export type GameView = 'nickname' | 'lobby' | 'ready' | 'battle' | 'result';

/**
 * Derived selector — computes the current view from existing store state.
 * No useEffect, no imperative setView. Pure derivation.
 */
export function useCurrentView(): GameView {
  const nickname = useConnectionStore((s) => s.nickname);
  const lobby = useLobbyStore((s) => s.lobby);
  const myPlayer = useLobbyStore((s) => s.getMyPlayer());
  const started = useBattleStore((s) => s.started);
  const finished = useBattleStore((s) => s.finished);

  if (finished) return 'result';
  if (started || lobby?.status === LobbyStatus.BATTLING) return 'battle';
  if (!nickname) return 'nickname';
  if (lobby?.status === LobbyStatus.FINISHED) return 'result';
  if (!lobby) return 'lobby';

  const hasTeam = myPlayer?.team && myPlayer.team.length > 0;
  if (hasTeam) return 'ready';

  return 'lobby';
}
