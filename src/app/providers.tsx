'use client';

import { HeroUIProvider } from '@heroui/react';
import { Toaster } from 'sonner';
import { GameProvider } from '@/presentation/providers/GameProvider';
import { LanguageProvider } from '@/lib/i18n';
import { LanguageToggle } from '@/presentation/components/ui/LanguageToggle';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <LanguageProvider>
        <GameProvider>
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            richColors
            closeButton
            duration={4000}
          />
          <LanguageToggle />
        </GameProvider>
      </LanguageProvider>
    </HeroUIProvider>
  );
}
