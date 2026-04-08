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
      <button
        type="button"
        disabled={busy}
        onClick={onGenerate}
        className="min-h-11 w-full touch-manipulation rounded border border-emerald-600/80 bg-emerald-700 px-5 py-2.5 text-base font-medium text-white shadow-sm transition hover:bg-emerald-600 active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {genStatus === 'generating' ? t('generating') : t('generate')}
      </button>
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
