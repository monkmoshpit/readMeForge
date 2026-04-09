export type ProjectType =
  | 'opensource'
  | 'saas'
  | 'api'
  | 'portfolio'
  | 'cli'
  | 'fullstack';

export type Tone = 'technical' | 'casual' | 'recruiter';

export interface ProjectData {
  name: string;
  description: string;
  languages: string[];
  topics: string[];
  homepage?: string;
  stars?: number;
  files?: string[];
  /** Preenchidos após buscar no GitHub — usados em badges/links no preview. */
  githubOwner?: string;
  githubRepo?: string;
}

export interface GeneratorFormData {
  projectData: ProjectData;
  projectType: ProjectType;
  tone: Tone;
  extraContext?: string;
}

export type RepoStatus = 'idle' | 'loading_repo' | 'error_repo';
export type GenStatus = 'idle' | 'generating' | 'done' | 'error_gen';
export type ReadmeLocale = 'pt-BR' | 'en' | 'es';
