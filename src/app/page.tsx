'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentView } from '@/application/stores';

const VIEW_TO_ROUTE: Record<string, string> = {
  nickname: '/register',
  lobby: '/lobby',
  ready: '/ready',
  battle: '/battle',
  result: '/result',
};

export default function Home() {
  const router = useRouter();
  const currentView = useCurrentView();

  useEffect(() => {
    router.replace(VIEW_TO_ROUTE[currentView] ?? '/register');
  }, [currentView, router]);

  return null;
}
