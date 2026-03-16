'use client';

import { useTranslation } from '@/lib/i18n';

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
      className="fixed bottom-4 right-4 z-[60] flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-slate-400 backdrop-blur-sm transition-all hover:border-slate-600 hover:text-slate-200"
      aria-label="Toggle language"
    >
      <span className="text-[13px] leading-none">
        {locale === 'en' ? '🇲🇽' : '🇺🇸'}
      </span>
      {locale === 'en' ? 'Español' : 'English'}
    </button>
  );
}
