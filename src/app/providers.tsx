'use client';

import { HeroUIProvider } from '@heroui/react';
import { GameProvider } from '@/presentation/providers/GameProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <GameProvider>{children}</GameProvider>
    </HeroUIProvider>
  );
}
