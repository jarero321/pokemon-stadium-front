'use client';

import { HeroUIProvider } from '@heroui/react';
import { GameProvider } from '@/presentation/providers/GameProvider';
import { LanguageProvider } from '@/lib/i18n';
import { LanguageToggle } from '@/presentation/components/ui/LanguageToggle';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <LanguageProvider>
        <GameProvider>
          {children}
          <LanguageToggle />
        </GameProvider>
      </LanguageProvider>
    </HeroUIProvider>
  );
}
