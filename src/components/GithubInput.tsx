import { useTranslation } from 'react-i18next';
import { normalizeGithubInputUrl } from '../services/github';
import type { RepoStatus } from '../types';

type Props = {
  onFetch: (url: string) => void;
  repoStatus: RepoStatus;
  disabled?: boolean;
};

export function GithubInput({ onFetch, repoStatus, disabled }: Props) {
  const { t } = useTranslation();
  const loading = repoStatus === 'loading_repo';
  const busy = loading || disabled;

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const raw = String(fd.get('url') ?? '');
        onFetch(normalizeGithubInputUrl(raw));
      }}
    >
      <div className="min-w-0 flex-1">
        <label htmlFor="github-url" className="mb-1.5 block text-[15px] font-medium text-zinc-300 sm:text-sm">
          {t('githubUrlLabel')}
        </label>
        <input
          id="github-url"
          name="url"
          type="text"
          inputMode="url"
          autoComplete="url"
          required
          disabled={busy}
          placeholder={t('githubUrlPlaceholder')}
          className="min-h-11 w-full rounded border border-zinc-600/70 bg-zinc-900/80 px-3 py-2.5 text-base text-slate-100 placeholder:text-zinc-500 focus:border-emerald-600/70 focus:outline-none focus:ring-2 focus:ring-emerald-600/25 disabled:opacity-50"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="min-h-11 w-full touch-manipulation rounded border border-emerald-600/80 bg-emerald-700 px-5 py-2.5 text-base font-medium text-white shadow-sm transition hover:bg-emerald-600 active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[7.5rem]"
      >
        {loading ? t('fetching') : t('fetch')}
      </button>
    </form>
  );
}
