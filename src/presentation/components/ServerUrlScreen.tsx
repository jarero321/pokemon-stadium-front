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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-xl p-8">
        <h1 className="screen-heading mb-2 text-center">
          {t('serverUrl.title')}
        </h1>
        <p className="mb-6 text-center text-sm text-white/40">
          {t('serverUrl.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="http://192.168.X.X:8080"
            className="glass-input"
            autoFocus
          />

          <p className="text-xs text-white/30">{t('serverUrl.hint')}</p>

          {error && <p className="text-sm text-neon-danger">{error}</p>}

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
  );
}
