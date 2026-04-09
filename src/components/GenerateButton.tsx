import { useTranslation } from 'react-i18next';
import type { GenStatus } from '../types';

type Props = {
  onGenerate: () => void;
  onCopy: () => void;
  onDownload: () => void;
  genStatus: GenStatus;
  hasReadme: boolean;
  disabled?: boolean;
};

export function GenerateButton({
  onGenerate,
  onCopy,
  onDownload,
  genStatus,
  hasReadme,
  disabled,
}: Props) {
  const { t } = useTranslation();
  const busy = genStatus === 'generating' || disabled;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <button
          type="button"
          disabled={busy}
          onClick={onGenerate}
          className="min-h-11 flex-1 touch-manipulation rounded border border-emerald-600/80 bg-emerald-700 px-5 py-2.5 text-base font-medium text-white shadow-sm transition hover:bg-emerald-600 active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {genStatus === 'generating' ? t('generating') : t('generate')}
        </button>
        {hasReadme && (
          <button
            type="button"
            disabled={busy}
            onClick={onGenerate}
            title={t('reroll', { defaultValue: 'Refazer' })}
            className="flex h-11 w-11 items-center justify-center rounded border border-zinc-700 bg-zinc-800/60 text-zinc-400 transition hover:bg-zinc-700 hover:text-zinc-100 disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`h-5 w-5 ${genStatus === 'generating' ? 'animate-spin' : ''}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        )}
      </div>
      <button
        type="button"
        disabled={!hasReadme || busy}
        onClick={onCopy}
        className="min-h-11 w-full touch-manipulation rounded border border-zinc-600/80 bg-zinc-800/70 px-5 py-2.5 text-base font-medium text-zinc-200 transition hover:bg-zinc-700 active:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {t('copy')}
      </button>
      <button
        type="button"
        disabled={!hasReadme || busy}
        onClick={onDownload}
        className="min-h-11 w-full touch-manipulation rounded border border-zinc-600/80 bg-zinc-800/70 px-5 py-2.5 text-base font-medium text-zinc-200 transition hover:bg-zinc-700 active:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {t('download')}
      </button>
    </div>
  );
}
