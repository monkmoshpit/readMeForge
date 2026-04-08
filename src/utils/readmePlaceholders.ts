/** Campos do formulário com id `field-<key>` (GitHub + contexto extra). */
export const README_FIELD_KEYS = [
  'name',
  'description',
  'homepage',
  'languages',
  'topics',
  'extraContext',
] as const;

export type ReadmeFieldKey = (typeof README_FIELD_KEYS)[number];

const DEFAULT_FIELD: ReadmeFieldKey = 'extraContext';

export function fieldIdForReadmeKey(key: string): string {
  const k = (README_FIELD_KEYS as readonly string[]).includes(key)
    ? (key as ReadmeFieldKey)
    : DEFAULT_FIELD;
  return `field-${k}`;
}

export function focusFieldByReadmeKey(key: string): void {
  const id = fieldIdForReadmeKey(key);
  const el = document.getElementById(id);
  if (!(el instanceof HTMLElement)) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if ('focus' in el && typeof el.focus === 'function') {
    el.focus();
  }
}
