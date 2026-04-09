import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CollapsibleSection } from './components/CollapsibleSection';
import { GithubInput } from './components/GithubInput';
import { GenerateButton } from './components/GenerateButton';
import { ExtraContextField, ProjectGithubFields } from './components/ProjectForm';
import { ReadmeLanguageSlider } from './components/ReadmeLanguageSlider';
import { TemplateSelector } from './components/TemplateSelector';
import { ToneSelector } from './components/ToneSelector';
import { PreviewContent } from './components/PreviewContent';
import { useReadmeGenerator } from './hooks/useReadmeGenerator';
import type { ReadmeLocale } from './types';

export default function App() {
  const { t } = useTranslation();
  const [readmeLocale, setReadmeLocale] = useState<ReadmeLocale>('pt-BR');
  const [editedReadmes, setEditedReadmes] = useState<Partial<Record<ReadmeLocale, string>>>({});

  const {
    formData,
    readmePt,
    readmeEn,
    readmeEs,
    repoStatus,
    genStatus,
    errorMessage,
    setProjectType,
    setTone,
    setExtraContext,
    updateProjectData,
    loadFromGithub,
    generate,
  } = useReadmeGenerator();

  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setAtBottom(window.scrollY > 200);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const togglePageScroll = () => {
    window.scrollTo({
      top: atBottom ? 0 : document.body.scrollHeight,
      behavior: 'smooth',
    });
  };

  const busy = repoStatus === 'loading_repo' || genStatus === 'generating';

  const originalActiveReadme =
    readmeLocale === 'en' ? readmeEn : readmeLocale === 'es' ? readmeEs : readmePt;
  const activeReadme = editedReadmes[readmeLocale] ?? originalActiveReadme;
  const hasAnyReadme = readmePt.length > 0 || readmeEn.length > 0 || readmeEs.length > 0;

  const onUpdateActiveReadme = useCallback((next: string) => {
    setEditedReadmes((prev) => ({ ...prev, [readmeLocale]: next }));
  }, [readmeLocale]);

  const githubMessages = useMemo(
    () => ({
      invalidUrl: t('githubInvalidUrl'),
      notFound: t('githubNotFound'),
      rateLimit: t('githubRateLimit'),
      apiError: (code: number) => t('githubError', { code }),
    }),
    [t],
  );

  const loadGithubGenMessages = useMemo(
    () => ({
      errLoadRepo: t('errLoadRepo'),
      errGenerate: t('errGenerate'),
      errEnvKey: t('errEnvKey'),
      errRateLimit: t('errRateLimit'),
    }),
    [t],
  );

  const generateMessages = useMemo(
    () => ({
      ...loadGithubGenMessages,
      genOneLanguageFailed: t('genOneLanguageFailed'),
    }),
    [t, loadGithubGenMessages],
  );

  const onFetch = useCallback(
    (url: string) => {
      loadFromGithub(url, githubMessages, loadGithubGenMessages);
    },
    [loadFromGithub, githubMessages, loadGithubGenMessages],
  );

  const onGenerate = useCallback(() => {
    generate(generateMessages);
  }, [generate, generateMessages]);

  const onCopy = useCallback(async () => {
    if (!activeReadme) return;
    try {
      await navigator.clipboard.writeText(activeReadme);
    } catch {
      /* ignore */
    }
  }, [activeReadme]);

  const onDownload = useCallback(() => {
    if (!activeReadme) return;
    const blob = new Blob([activeReadme], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
  }, [activeReadme]);

  return (
    <div className="relative min-h-screen text-slate-100">
      <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-10">
        <header className="mb-6 text-center sm:mb-8">
          <h1 className="text-xl font-semibold leading-tight tracking-tight text-zinc-100 sm:text-2xl md:text-3xl">
            README<span className="text-emerald-500">.</span>forge
          </h1>
          <p className="mt-2 max-w-lg mx-auto text-base leading-relaxed text-zinc-400 sm:text-sm sm:text-zinc-500">
            {t('appSubtitle')}
          </p>
        </header>

        <section className="mb-6 rounded-md border border-zinc-700/50 bg-zinc-900/40 p-4 sm:mb-8 sm:p-5">
          <GithubInput onFetch={onFetch} repoStatus={repoStatus} disabled={busy} />
        </section>

        {errorMessage ? (
          <p className="mb-5 rounded border border-red-500/35 bg-red-950/30 px-3 py-3 text-[15px] leading-relaxed text-red-200/95 sm:mb-6 sm:px-4 sm:text-sm">
            {errorMessage}
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <section className="space-y-4 rounded-md border border-zinc-700/50 bg-zinc-900/40 p-4 sm:space-y-5 sm:p-5">
            <CollapsibleSection title={t('sectionProjectAndTone')}>
              <div className="space-y-6">
                <TemplateSelector
                  value={formData.projectType}
                  onChange={setProjectType}
                  disabled={busy}
                />
                <ToneSelector value={formData.tone} onChange={setTone} disabled={busy} />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title={t('sectionRepoData')}>
              <ProjectGithubFields
                projectData={formData.projectData}
                onChange={updateProjectData}
                disabled={busy}
              />
            </CollapsibleSection>

            <div className="rounded-md border border-zinc-700/50 bg-zinc-900/35 p-3 sm:p-4">
              <h3 className="mb-2 text-[15px] font-medium text-zinc-200 sm:mb-3 sm:text-sm">
                {t('sectionExtraContext')}
              </h3>
              <ExtraContextField
                value={formData.extraContext ?? ''}
                onChange={setExtraContext}
                disabled={busy}
              />
            </div>

            <GenerateButton
              onGenerate={onGenerate}
              onCopy={onCopy}
              onDownload={onDownload}
              genStatus={genStatus}
              hasReadme={activeReadme.length > 0}
              disabled={busy}
            />
          </section>

          <section className="rounded-md border border-zinc-700/50 bg-zinc-900/40 p-4 sm:p-5">
            <div className="mb-3 flex flex-col gap-3 border-b border-zinc-700/50 pb-3 sm:mb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:pb-4">
              <h2 className="text-[1.05rem] font-medium leading-snug text-zinc-200 sm:text-lg">
                {t('previewTitle')}
              </h2>
              <ReadmeLanguageSlider
                value={readmeLocale}
                onChange={setReadmeLocale}
                disabled={repoStatus === 'loading_repo'}
              />
            </div>
            <PreviewContent
              hasAnyReadme={hasAnyReadme}
              genStatus={genStatus}
              activeReadme={activeReadme}
              formData={formData}
              readmeLocale={readmeLocale}
              onUpdateActiveReadme={onUpdateActiveReadme}
            />
          </section>
        </div>
      </div>
      {/* Global Scroll Toggle */}
      <button
        type="button"
        onClick={togglePageScroll}
        className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700/60 bg-zinc-900/90 text-zinc-300 shadow-lg backdrop-blur-md transition-all hover:bg-zinc-800 hover:text-white sm:h-10 sm:w-10 sm:bottom-6 sm:right-6"
        aria-label="Scroll Toggle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`h-5 w-5 transition-transform duration-500 ease-out sm:h-6 sm:w-6 ${
            atBottom ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
    </div>
  );
}
