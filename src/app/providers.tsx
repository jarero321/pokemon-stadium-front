'use client';

import { HeroUIProvider } from '@heroui/react';
import { Toaster } from 'sonner';
import { GameProvider } from '@/presentation/providers/GameProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <GameProvider>
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
      </GameProvider>
    </HeroUIProvider>
  );
}
