import { isPlaceholderUrl, isPlaceholderText } from './readmePreviewMarkdown';

export type InlineAlertMeta = {
  id: string;
  kind: 'license' | 'forge-aviso';
  excerptStart: number;
  excerptEnd: number;
  excerptText: string;
};

type AlertifyOptions = {
  base: string;
  t: (key: string, options?: any) => string;
};

export const buildAlertifiedMarkdown = ({
  base,
  t,
}: AlertifyOptions): { markdown: string; alerts: Record<string, InlineAlertMeta> } => {
  const alerts: Record<string, InlineAlertMeta> = {};
  const lines = base.split('\n');
  let offset = 0;
  const out: string[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    const lineStart = offset;
    const lineEnd = lineStart + line.length;
    offset += line.length + 1; // + '\n'

    const trimmed = line.trim();

    const forgeMatch = /^README_FORGE_AVISO:([^:]+):\s*(.*)$/.exec(trimmed);
    const isPurePlaceholder = !forgeMatch && isPlaceholderText(trimmed);

    if (forgeMatch || isPurePlaceholder) {
      const id = `forge-aviso-${i}`;
      alerts[id] = {
        id,
        kind: 'forge-aviso',
        excerptStart: lineStart,
        excerptEnd: lineEnd,
        excerptText: line,
      };

      let message = forgeMatch ? (forgeMatch[2] ?? '').trim() : trimmed;
      if (forgeMatch && !message) {
        const field = forgeMatch[1] ?? '';
        message = t(`fieldPlaceholder_${field}`, { defaultValue: `Adicionar ${field}` });
      }

      out.push(`[${message}](forge-alert://aviso?id=${encodeURIComponent(id)}&style=block)`);
      continue;
    }

    if (/^\s*```/.test(line) || /`/.test(line)) {
      out.push(line);
      continue;
    }

    const re =
      /\b(licen[sc]e|licen[çc]a|todo|to\s+do|a\s+fazer|placeholder|fake|link|url|badge|status|LICENSE_ERROR_ALERT)\b/gi;
    const m = re.exec(line);

    const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(line);
    if (linkMatch && isPlaceholderUrl(linkMatch[2])) {
      const col = linkMatch.index;
      const id = `link-aviso-${i}-${col}`;
      alerts[id] = {
        id,
        kind: 'forge-aviso',
        excerptStart: lineStart + col,
        excerptEnd: lineStart + col + linkMatch[0].length,
        excerptText: linkMatch[0],
      };
      const before = line.slice(0, col);
      const after = line.slice(col + linkMatch[0].length);
      out.push(
        `${before}[${linkMatch[1]}](forge-alert://aviso?id=${encodeURIComponent(
          id,
        )}&style=inline)${after}`,
      );
      continue;
    }

    if (!m || m.index == null) {
      out.push(line);
      continue;
    }

    const col = m.index;
    const id = `inline-alert-${i}-${col}`;

    alerts[id] = {
      id,
      kind: 'license',
      excerptStart: lineStart + col,
      excerptEnd: lineStart + col + m[0].length,
      excerptText: m[0],
    };

    const before = line.slice(0, col);
    const hit = line.slice(col, col + m[0].length);
    const after = line.slice(col + m[0].length);
    out.push(`${before}[${hit}](forge-alert://placeholder?id=${encodeURIComponent(id)})${after}`);
  }

  return { markdown: out.join('\n'), alerts };
};
