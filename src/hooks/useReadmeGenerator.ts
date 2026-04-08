import { useCallback, useState } from 'react';
import { fetchProjectData, type GithubMessages } from '../services/github';
import { generateReadmeStream } from '../services/groq';
import type { GenStatus, GeneratorFormData, ProjectData, ProjectType, RepoStatus, Tone } from '../types';

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
};

type GenMessages = LoadGithubGenMessages & {
  genOneLanguageFailed: string;
};

const STAGGER_STEP_MS = 220;

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

      const runAfter = async (delayMs: number, locale: 'pt-BR' | 'en' | 'es', push: (s: string) => void) => {
        if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
        await generateReadmeStream(formData, locale, (chunk) => {
          push(chunk);
        });
      };

      const [ptResult, enResult, esResult] = await Promise.allSettled([
        runAfter(0, 'pt-BR', (c) => setReadmePt((prev) => prev + c)),
        runAfter(STAGGER_STEP_MS, 'en', (c) => setReadmeEn((prev) => prev + c)),
        runAfter(STAGGER_STEP_MS * 2, 'es', (c) => setReadmeEs((prev) => prev + c)),
      ]);

      const ok = [ptResult, enResult, esResult].filter((r) => r.status === 'fulfilled').length;
      if (ok === 0) {
        setGenStatus('error_gen');
        const r = [ptResult, enResult, esResult].find((x) => x.status === 'rejected');
        const reason = r?.status === 'rejected' ? r.reason : undefined;
        const msg = reason instanceof Error ? reason.message : String(reason ?? '');
        if (msg === 'ENV_KEY') {
          setErrorMessage(gen.errEnvKey);
        } else {
          setErrorMessage(gen.errGenerate);
        }
        return;
      }

      setGenStatus('done');

      if (ok < 3) {
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
