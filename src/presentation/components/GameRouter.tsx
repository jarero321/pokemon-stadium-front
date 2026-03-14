'use client';

import { useCurrentView } from '@/application/stores';
import { NicknameScreen } from './NicknameScreen';
import { LobbyScreen } from './LobbyScreen';
import { ReadyScreen } from './ReadyScreen';
import { BattleScreen } from './BattleScreen';
import { ResultScreen } from './ResultScreen';

const screens: Record<string, React.FC> = {
  nickname: NicknameScreen,
  lobby: LobbyScreen,
  ready: ReadyScreen,
  battle: BattleScreen,
  result: ResultScreen,
};

export function GameRouter() {
  const currentView = useCurrentView();
  const Screen = screens[currentView] ?? NicknameScreen;
  return <Screen />;
}
