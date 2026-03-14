'use client';

import { useTranslation } from '@/lib/i18n';

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
      className="fixed bottom-4 right-4 z-[60] flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-xs font-bold uppercase text-white/70 backdrop-blur-sm transition-all hover:border-white/25 hover:text-white"
      aria-label="Toggle language"
    >
      {locale === 'en' ? 'ES' : 'EN'}
    </button>
  );
}
