const BRACKET_PLACEHOLDER_RE =
  /\[(?:to\s*do|TODO|a\s*fazer|placeholder)\]/gi;

/**
 * Corrige Markdown quebrado pelo stream (comum na versão EN): `]` e `(` em linhas
 * diferentes quebram `[![badge](src)](href)` e o preview vira texto cru.
 */
export function normalizeMarkdownLineBreaks(md: string): string {
  let s = md;
  let prev = '';
  let guard = 0;
  while (prev !== s && guard < 12) {
    prev = s;
    guard += 1;
    s = s.replace(/\]\s*\n\s*\(/g, '](');
    s = s.replace(/\)\s*\n\s*(\[!?\[)/g, ') $1');
  }
  return s;
}

/** URL de badge/link de licença ainda com placeholder — não substituir slug; preview mostra vermelho. */
function isLicensePlaceholderNearby(full: string, offset: number, matchLen: number): boolean {
  const ctx = full.slice(Math.max(0, offset - 160), offset + matchLen + 160);
  if (!/\/license\//i.test(ctx) && !/shields\.io\/github\/license/i.test(ctx)) {
    return false;
  }
  return /(to\s*do|to%20do|to\+do)/i.test(ctx);
}

/**
 * Substitui `to do` em URLs por `owner/repo`, exceto em paths de **licença** (fica vermelho no preview).
 */
function injectSlugIntoPaths(text: string, owner: string, repo: string): string {
  const slug = `${owner}/${repo}`;
  const enc = `${encodeURIComponent(owner)}%2F${encodeURIComponent(repo)}`;
  let s = text;

  s = s.replace(/to%20do/gi, (m, offset, full) =>
    isLicensePlaceholderNearby(full, offset, m.length) ? m : enc,
  );
  s = s.replace(/to\+do/gi, (m, offset, full) =>
    isLicensePlaceholderNearby(full, offset, m.length) ? m : enc,
  );
  s = s.replace(
    /https:\/\/github\.com\/to\s+do(?=\/|\)|\?|#|\s|"|$)/gi,
    (m, offset, full) =>
      isLicensePlaceholderNearby(full, offset, m.length) ? m : `https://github.com/${slug}`,
  );
  s = s.replace(/\/to\s+do(?=\/|\)|\?|#|\s|"|$)/gi, (m, offset, full) =>
    isLicensePlaceholderNearby(full, offset, m.length) ? m : `/${slug}`,
  );
  return s;
}

/**
 * Badge/link/URL com placeholder/TODO — mostrar vermelho no preview.
 */
export function isPlaceholderUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  // Se contiver license + todo, ou apenas padrões óbvios de placeholder
  return (
    lower.includes('license') && /(to\s*do|to%20do|to\+do)/i.test(url)
  ) || /(to\s*do|fake|placeholder|a\s+fazer|link\s+da\s+licença|tipo\s+de\s+licença|badge|status|url)/i.test(lower);
}

/**
 * Texto que parece ser um placeholder ou aviso técnico que não deveria estar no README final.
 */
export function isPlaceholderText(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes('readme_forge_aviso') ||
    /\[(to\s*do|a\s*fazer|placeholder)\]/i.test(lower) ||
    /\b(tipo\s+de\s+licença|informações\s+adicionais|licença|license|status|badge|link|url)\b/i.test(lower.trim())
  );
}

const LEGACY_PLACEHOLDER_LINE =
  '\n\nREADME_FORGE_AVISO:extraContext:Revise este trecho no formulário.\n\n';

/**
 * 1) Normaliza quebras que quebram links/badges.
 * 2) Protege `[to do]` para não quebrar ao substituir `to do` em URLs.
 * 3) Substitui placeholders de path em URLs por `owner/repo` (exceto licença com todo).
 * 4) Troca marcadores legados por linha README_FORGE_AVISO (sem links fictícios).
 */
export function prepareReadmePreviewMarkdown(
  markdown: string,
  owner: string | undefined,
  repo: string | undefined,
): string {
  let s = normalizeMarkdownLineBreaks(markdown);

  const saved: string[] = [];
  s = s.replace(BRACKET_PLACEHOLDER_RE, (m) => {
    const id = saved.length;
    saved.push(m);
    return `§§PH${id}§§`;
  });

  if (owner && repo) {
    s = injectSlugIntoPaths(s, owner, repo);
  }

  s = s.replace(/§§PH(\d+)§§/g, (_, id) => saved[Number(id)] ?? '');
  s = s.replace(BRACKET_PLACEHOLDER_RE, LEGACY_PLACEHOLDER_LINE);

  // Nunca deixar linhas técnicas README_FORGE_AVISO vazarem cruas no preview — 
  // agora elas serão capturadas como alertas interativos no ReadmePreview.
  // s = s.replace(/^\s*README_FORGE_AVISO:[^:]+:\s*.*$/gm, '');

  return s;
}
