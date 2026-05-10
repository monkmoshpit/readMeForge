import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type GroqConfigProps = {
  apiKey: string | null;
  onSave: (key: string) => void;
  onClear: () => void;
};

export function GroqConfig({ apiKey, onSave, onClear }: GroqConfigProps) {
  const { t } = useTranslation();
  const [inputKey, setInputKey] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);

  const handleSave = () => {
    if (inputKey.trim()) {
      onSave(inputKey.trim());
      setInputKey('');
    }
  };

  return (
    <div className="rounded-md border border-zinc-700/50 bg-zinc-900/40 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1 space-y-2">
          <label htmlFor="groq-key" className="text-[15px] font-medium text-zinc-200 sm:text-sm">
            {t('groqKeyLabel')}
          </label>
          <div className="flex gap-2">
            <input
              id="groq-key"
              type="password"
              placeholder={apiKey ? '••••••••••••••••' : t('groqKeyPlaceholder')}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="flex-1 rounded border border-zinc-700/60 bg-zinc-950/40 px-3 py-2 text-[15px] text-zinc-100 outline-none transition-all focus:border-emerald-500/50 sm:text-sm"
            />
            {apiKey ? (
              <button
                onClick={onClear}
                className="rounded border border-red-500/30 bg-red-950/20 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-900/30"
              >
                {t('groqKeyClear')}
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!inputKey.trim()}
                className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
              >
                {t('groqKeySave')}
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowTutorial(!showTutorial)}
          className="text-sm font-medium text-emerald-400 underline-offset-4 hover:underline"
        >
          {t('groqKeyTutorialTitle')}
        </button>
      </div>

      {!apiKey && (
        <p className="mt-3 text-xs text-amber-200/70">
          {t('groqKeyRequired')}
        </p>
      )}

      {showTutorial && (
        <div className="mt-6 space-y-4 rounded-md border border-emerald-500/20 bg-emerald-950/10 p-4 sm:p-5">
          <h4 className="text-[15px] font-semibold text-emerald-100 sm:text-sm">
            {t('groqKeyTutorialTitle')}
          </h4>
          <ol className="space-y-3 text-[14px] text-zinc-300 sm:text-sm">
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[12px] font-bold text-emerald-400">1</span>
              <span>{t('groqKeyTutorialStep1')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[12px] font-bold text-emerald-400">2</span>
              <span>{t('groqKeyTutorialStep2')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[12px] font-bold text-emerald-400">3</span>
              <span>{t('groqKeyTutorialStep3')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[12px] font-bold text-emerald-400">4</span>
              <span>{t('groqKeyTutorialStep4')}</span>
            </li>
          </ol>
          <div className="pt-2">
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-zinc-700"
            >
              {t('groqKeyTutorialLink')}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3 w-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
