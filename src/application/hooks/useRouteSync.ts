'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentView, type GameView } from '@/application/stores';

const VIEW_TO_ROUTE: Record<GameView, string> = {
  nickname: '/register',
  lobby: '/lobby',
  ready: '/ready',
  battle: '/battle',
  result: '/result',
};

export function useRouteSync() {
  const router = useRouter();
  const pathname = usePathname();
  const currentView = useCurrentView();
  const prevView = useRef<GameView | null>(null);

  useEffect(() => {
    const targetRoute = VIEW_TO_ROUTE[currentView];

    // Only navigate if the view changed and the route doesn't match
    if (prevView.current !== currentView && pathname !== targetRoute) {
      router.replace(targetRoute);
    }

    prevView.current = currentView;
  }, [currentView, pathname, router]);
}
