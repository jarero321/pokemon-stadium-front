'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';

interface ServerUrlScreenProps {
  onSubmit: (url: string) => void;
}

export function ServerUrlScreen({ onSubmit }: ServerUrlScreenProps) {
  const [input, setInput] = useState('http://localhost:8080');
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim().replace(/\/+$/, '');

    try {
      new URL(trimmed);
    } catch {
      setError(t('serverUrl.invalid'));
      return;
    }

    setError(null);
    onSubmit(trimmed);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 ">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-2xl p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="screen-title brand-gradient mb-2">
              {t('serverUrl.title')}
            </h1>
            <p className="screen-subtitle">{t('serverUrl.subtitle')}</p>
          </div>

          {/* Dev mode indicator */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              {t('leaderboard.devMode')}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="http://192.168.X.X:8080"
                className="glass-input"
                autoFocus
              />
              <p className="mt-2 text-xs text-slate-500">
                {t('serverUrl.hint')}
              </p>
            </div>

            {error && (
              <div className="alert-banner alert-banner--error">{error}</div>
            )}

            <button
              type="submit"
              disabled={!input.trim()}
              className="battle-btn battle-btn--primary"
            >
              {t('serverUrl.connect')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
