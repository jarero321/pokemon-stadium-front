'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { Dictionary, Locale } from './types';
import { en } from './en';
import { es } from './es';

const dictionaries: Record<Locale, Dictionary> = { en, es };

type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>,
) => string;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'pokemon-stadium-lang';

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'es') return stored;
  const nav = navigator.language.slice(0, 2);
  return nav === 'es' ? 'es' : 'en';
}

function resolve(dict: Dictionary, key: string): string | string[] | undefined {
  const parts = key.split('.');
  let current: unknown = dict;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current === 'string') return current;
  if (Array.isArray(current)) return current;
  return undefined;
}

function interpolate(
  text: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
    const val = vars[varName];
    return val != null ? String(val) : `{{${varName}}}`;
  });
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const t: TranslateFn = useCallback(
    (key, vars) => {
      const value =
        resolve(dictionaries[locale], key) ?? resolve(dictionaries.en, key);
      if (typeof value === 'string') return interpolate(value, vars);
      if (Array.isArray(value))
        return value.map((v) => interpolate(v, vars)).join('\n');
      return key;
    },
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx)
    throw new Error('useTranslation must be used within LanguageProvider');
  return ctx;
}

/**
 * Get tips array from the dictionary directly.
 */
export function useTips(): string[] {
  const { locale } = useTranslation();
  return dictionaries[locale].ready.tips;
}

/**
 * Get battle tips array from the dictionary directly.
 */
export function useBattleTips(): string[] {
  const { locale } = useTranslation();
  return dictionaries[locale].battle.tips;
}
