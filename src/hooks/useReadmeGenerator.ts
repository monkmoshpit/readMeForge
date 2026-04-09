import { useCallback, useState } from 'react';
import { fetchProjectData, type GithubMessages } from '../services/github';
import { generateReadmeStream } from '../services/groq';
import type { GenStatus, GeneratorFormData, ProjectData, ProjectType, RepoStatus, Tone, ReadmeLocale } from '../types';

const emptyProject = (): ProjectData => ({
  name: '',
  description: '',
  languages: [],
  topics: [],
  githubOwner: undefined,
  githubRepo: undefined,
});

type LoadGithubGenMessages = {
  errLoadRepo: string;
  errGenerate: string;
  errEnvKey: string;
  errRateLimit?: string;
};

type GenMessages = LoadGithubGenMessages & {
  genOneLanguageFailed: string;
};


export function useReadmeGenerator() {
  const [formData, setFormData] = useState<GeneratorFormData>({
    projectData: emptyProject(),
    projectType: 'opensource',
    tone: 'technical',
    extraContext: '',
  });
  const [readmePt, setReadmePt] = useState('');
  const [readmeEn, setReadmeEn] = useState('');
  const [readmeEs, setReadmeEs] = useState('');
  const [repoStatus, setRepoStatus] = useState<RepoStatus>('idle');
  const [genStatus, setGenStatus] = useState<GenStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setProjectType = useCallback((projectType: ProjectType) => {
    setFormData((f) => ({ ...f, projectType }));
  }, []);

  const setTone = useCallback((tone: Tone) => {
    setFormData((f) => ({ ...f, tone }));
  }, []);

  const setExtraContext = useCallback((extraContext: string) => {
    setFormData((f) => ({ ...f, extraContext }));
  }, []);

  const updateProjectData = useCallback((patch: Partial<ProjectData>) => {
    setFormData((f) => ({
      ...f,
      projectData: { ...f.projectData, ...patch },
    }));
  }, []);

  const loadFromGithub = useCallback(
    async (url: string, gh: GithubMessages, gen: LoadGithubGenMessages) => {
      setErrorMessage(null);
      setRepoStatus('loading_repo');
      try {
        const projectData = await fetchProjectData(url, gh);
        setFormData((f) => ({ ...f, projectData }));
        setRepoStatus('idle');
      } catch (e) {
        setRepoStatus('error_repo');
        setErrorMessage(e instanceof Error ? e.message : gen.errLoadRepo);
      }
    },
    [],
  );

  /** Gera PT-BR, EN e ES (atrasos escalonados para reduzir rate limit). */
  const generate = useCallback(
    async (gen: GenMessages) => {
      setErrorMessage(null);
      setGenStatus('generating');
      setReadmePt('');
      setReadmeEn('');
      setReadmeEs('');

      const tasks = [
        { locale: 'pt-BR' as const, set: (c: string) => setReadmePt((prev) => prev + c) },
        { locale: 'en' as const, set: (c: string) => setReadmeEn((prev) => prev + c) },
        { locale: 'es' as const, set: (c: string) => setReadmeEs((prev) => prev + c) },
      ];

      let successCount = 0;
      let lastError: any = null;

      for (let i = 0; i < tasks.length; i++) {
        const { locale, set } = tasks[i]!;
        try {
          await generateReadmeStream(formData, locale, set);
          successCount++;
          // Small safety buffer between requests
          if (i < tasks.length - 1) {
            await new Promise((r) => setTimeout(r, 800));
          }
        } catch (e) {
          lastError = e;
          // If we hit a rate limit or env key error, stop subsequent requests
          const msg = e instanceof Error ? e.message : String(e ?? '');
          if (msg === 'ENV_KEY' || msg.includes('429')) {
            break;
          }
        }
      }

      if (successCount === 0 && lastError) {
        setGenStatus('error_gen');
        const msg = lastError instanceof Error ? lastError.message : String(lastError ?? '');
        if (msg === 'ENV_KEY') {
          setErrorMessage(gen.errEnvKey);
        } else if (msg.includes('429')) {
          setErrorMessage(gen.errRateLimit ?? 'Rate limit exceeded. Please wait a few seconds.');
        } else {
          setErrorMessage(gen.errGenerate);
        }
        return;
      }

      setGenStatus('done');

      if (successCount < tasks.length) {
        setErrorMessage(gen.genOneLanguageFailed);
      }
    },
    [formData],
  );

  return {
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
  };
}
