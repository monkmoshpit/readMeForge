import type { ReadmeFieldKey } from './readmePlaceholders';
import { README_FIELD_KEYS } from './readmePlaceholders';

export const FORGE_WARN_LINE =
  /^README_FORGE_AVISO:([^:\s]+):\s*(.+?)\s*$/;

export type ReadmeSegment =
  | { type: 'markdown'; content: string }
  | { type: 'warning'; field: ReadmeFieldKey; message: string };

export function normalizeWarnField(raw: string): ReadmeFieldKey {
  const k = raw.trim();
  if ((README_FIELD_KEYS as readonly string[]).includes(k)) {
    return k as ReadmeFieldKey;
  }
  return 'extraContext';
}

/** Parte o Markdown em blocos e linhas `README_FORGE_AVISO:campo:texto` (linha inteira). */
export function splitMarkdownWithForgeWarnings(markdown: string): ReadmeSegment[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const segments: ReadmeSegment[] = [];
  const buf: string[] = [];

  const flush = () => {
    const content = buf.join('\n');
    buf.length = 0;
    if (content.trim().length > 0) {
      segments.push({ type: 'markdown', content });
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const m = FORGE_WARN_LINE.exec(trimmed);
    if (m) {
      const message = (m[2] ?? '').trim();
      if (!message) {
        continue;
      }
      flush();
      segments.push({
        type: 'warning',
        field: normalizeWarnField(m[1] ?? ''),
        message,
      });
    } else {
      buf.push(line);
    }
  }
  flush();
  return segments;
}
