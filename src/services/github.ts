import type { ProjectData } from '../types';

const GH_ACCEPT = 'application/vnd.github+json';

export type GithubMessages = {
  invalidUrl: string;
  notFound: string;
  rateLimit: string;
  apiError: (code: number) => string;
};

/** Garante esquema https para parse e fetch (aceita `github.com/dono/repo`). */
export function normalizeGithubInputUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^git@github\.com:/i.test(t)) {
    return t.replace(/^git@github\.com:/i, 'https://github.com/');
  }
  if (!/^https?:\/\//i.test(t)) {
    return `https://${t}`;
  }
  return t;
}

export function parseGithubRepoUrl(raw: string): { owner: string; repo: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const normalized = normalizeGithubInputUrl(trimmed);
    const u = new URL(normalized.replace(/^git@github\.com:/, 'https://github.com/'));
    if (u.hostname !== 'github.com' && !u.hostname.endsWith('.github.com')) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0]!;
    const repo = parts[1]!.replace(/\.git$/i, '');
    return { owner, repo };
  } catch {
    return null;
  }
}

async function ghJson<T>(path: string, messages: GithubMessages): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: GH_ACCEPT,
      'User-Agent': 'readme-forge-readme-generator',
    },
  });
  if (res.status === 404) throw new Error(messages.notFound);
  if (res.status === 403) throw new Error(messages.rateLimit);
  if (!res.ok) throw new Error(messages.apiError(res.status));
  return res.json() as Promise<T>;
}

async function fetchRootFiles(
  owner: string,
  repo: string,
  messages: GithubMessages,
): Promise<string[]> {
  const data = await ghJson<{ name: string; type: string }[]>(
    `/repos/${owner}/${repo}/contents`,
    messages,
  );
  return data.filter((x) => x.type === 'file').map((x) => x.name);
}

export async function fetchProjectData(
  repoUrl: string,
  messages: GithubMessages,
): Promise<ProjectData> {
  const parsed = parseGithubRepoUrl(repoUrl);
  if (!parsed) throw new Error(messages.invalidUrl);

  const { owner, repo } = parsed;

  const [meta, langs, rootFiles] = await Promise.all([
    ghJson<{
      name: string;
      description: string | null;
      topics: string[];
      homepage: string | null;
      stargazers_count: number;
    }>(`/repos/${owner}/${repo}`, messages),
    ghJson<Record<string, number>>(`/repos/${owner}/${repo}/languages`, messages),
    fetchRootFiles(owner, repo, messages).catch(() => [] as string[]),
  ]);

  const languages = Object.entries(langs)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);

  return {
    name: meta.name,
    description: meta.description ?? '',
    languages,
    topics: meta.topics ?? [],
    homepage: meta.homepage ?? undefined,
    stars: meta.stargazers_count,
    files: rootFiles,
    githubOwner: owner,
    githubRepo: repo,
  };
}
