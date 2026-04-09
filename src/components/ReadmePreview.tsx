import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import type { ReadmeFieldKey } from '../utils/readmePlaceholders';
import { focusFieldByReadmeKey } from '../utils/readmePlaceholders';
import {
  isLicenseUrlWithTodo,
  prepareReadmePreviewMarkdown,
} from '../utils/readmePreviewMarkdown';
import { useTranslation } from 'react-i18next';
import { splitMarkdownWithForgeWarnings } from '../utils/readmeForgeWarnings';

type Props = {
  markdown: string;
  placeholderToast: string;
  licensePlaceholderToast: string;
  githubOwner?: string;
  githubRepo?: string;
  onUpdateMarkdown: (next: string) => void;
};

const TOAST_MS = 3200;

const warnBoxClass =
  'inline-flex cursor-pointer items-center rounded bg-red-950/40 px-2 py-0.5 text-[13px] font-medium text-red-100 underline decoration-red-400/70 underline-offset-2 transition hover:bg-red-950/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 sm:text-xs';

const inlineAlertClass =
  'inline-flex cursor-pointer items-center rounded bg-red-500/15 px-1 py-0.5 text-[13px] font-medium text-red-50 underline decoration-red-300/70 underline-offset-2 transition hover:bg-red-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 sm:text-xs';

type ChunkProps = {
  content: string;
  onLicenseTodo: (anchor: DOMRect) => void;
  onInlineAlertClick: (alertId: string, anchor: DOMRect) => void;
};

function MarkdownChunk({
  content,
  onLicenseTodo,
  licenseFallbackAlt,
  onInlineAlertClick,
}: ChunkProps & { licenseFallbackAlt: string }) {
  return (
    <div className="readme-md max-w-none">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ href, children, ...rest }) => {
            if (href && href.startsWith('forge-alert://')) {
              const m = /^forge-alert:\/\/([^?]+)\?id=([^&]+)(?:&.*)?$/i.exec(href);
              const id = m?.[2] ?? '';
              return (
                <span
                  role="button"
                  tabIndex={0}
                  className={inlineAlertClass}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (id) onInlineAlertClick(decodeURIComponent(id), e.currentTarget.getBoundingClientRect());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (id) onInlineAlertClick(decodeURIComponent(id), e.currentTarget.getBoundingClientRect());
                    }
                  }}
                >
                  {children}
                </span>
              );
            }
            if (href && isLicenseUrlWithTodo(href)) {
              return (
                <span
                  role="button"
                  tabIndex={0}
                  className={warnBoxClass}
                  onClick={(e) => {
                    e.preventDefault();
                    onLicenseTodo(e.currentTarget.getBoundingClientRect());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onLicenseTodo(e.currentTarget.getBoundingClientRect());
                    }
                  }}
                >
                  {children}
                </span>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
                {children}
              </a>
            );
          },
          img: ({ src, alt, title, ...rest }) => {
            const s = src ?? '';
            if (isLicenseUrlWithTodo(s)) {
              const label = (alt ?? '').trim() || licenseFallbackAlt;
              return (
                <span
                  role="button"
                  tabIndex={0}
                  className={`${warnBoxClass} inline-block w-auto max-w-full`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onLicenseTodo(e.currentTarget.getBoundingClientRect());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onLicenseTodo(e.currentTarget.getBoundingClientRect());
                    }
                  }}
                >
                  {label}
                </span>
              );
            }
            return (
              <img
                src={s}
                alt={alt ?? ''}
                title={title}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="my-1 mr-2 inline-block max-h-8 max-w-full align-middle"
                {...rest}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function ForgeWarningBlock({
  message,
  onGoToField,
  warningBlockTitle,
  warningBannerLabel,
}: {
  message: string;
  onGoToField: () => void;
  warningBlockTitle: string;
  warningBannerLabel: string;
}) {
  return (
    <span
      role="button"
      className={warnBoxClass}
      title={message || warningBlockTitle}
      onClick={onGoToField}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onGoToField();
        }
      }}
      tabIndex={0}
    >
      {message || warningBannerLabel}
    </span>
  );
}

export function ReadmePreview({
  markdown,
  placeholderToast,
  licensePlaceholderToast,
  githubOwner,
  githubRepo,
  onUpdateMarkdown,
}: Props) {
  const { t } = useTranslation();
  const [toast, setToast] = useState<string | null>(null);
  const [activeInlineAlertId, setActiveInlineAlertId] = useState<string | null>(null);
  const [manualEditMeta, setManualEditMeta] = useState<InlineAlertMeta | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const [inlineAlertDraft, setInlineAlertDraft] = useState<string>('');

  type InlineAlertMeta = {
    id: string;
    kind: 'license';
    excerptStart: number;
    excerptEnd: number;
    excerptText: string;
  };

  const buildAlertifiedMarkdown = (base: string): { markdown: string; alerts: Record<string, InlineAlertMeta> } => {
    // Convert stray legacy tokens into something clickable instead of raw text.
    const normalized = base.replace(/LICENSE_ERROR_ALERT/g, 'license');
    const alerts: Record<string, InlineAlertMeta> = {};

    // Very conservative: only scan non-code, non-link-heavy lines.
    // We anchor edits/deletions at the whole line to avoid corrupting Markdown structure.
    const lines = normalized.replace(/\r\n/g, '\n').split('\n');
    let offset = 0;
    const out: string[] = [];

    const makeId = (lineIdx: number, col: number) => `license-${lineIdx}-${col}`;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i] ?? '';
      const lineStart = offset;
      const lineEnd = lineStart + line.length;
      offset += line.length + 1; // + '\n'

      // Skip code fences, inline code-ish lines, and markdown link lines (avoid breaking syntax).
      if (/^\s*```/.test(line) || /`/.test(line) || /\]\([^)]+\)/.test(line)) {
        out.push(line);
        continue;
      }

      // Heuristic: flag suspicious "license" mentions (often accompanied by fake URLs / placeholders).
      const re = /\blicen[sc]e\b/gi;
      const m = re.exec(line);
      if (!m || m.index == null) {
        out.push(line);
        continue;
      }

      const col = m.index;
      const id = makeId(i, col);

      alerts[id] = {
        id,
        kind: 'license',
        excerptStart: lineStart,
        excerptEnd: lineEnd,
        excerptText: normalized.slice(lineStart, lineEnd),
      };

      // Wrap just the word in a synthetic link we intercept in the renderer.
      const before = line.slice(0, col);
      const hit = line.slice(col, col + m[0].length);
      const after = line.slice(col + m[0].length);
      out.push(`${before}[${hit}](forge-alert://license?id=${encodeURIComponent(id)})${after}`);
    }

    return { markdown: out.join('\n'), alerts };
  };

  const previewModel = useMemo(() => {
    const base = prepareReadmePreviewMarkdown(markdown, githubOwner, githubRepo);
    const alertified = buildAlertifiedMarkdown(base);
    const segments = splitMarkdownWithForgeWarnings(alertified.markdown);
    return { base, segments, alerts: alertified.alerts };
  }, [markdown, githubOwner, githubRepo]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!activeInlineAlertId) return;
    const meta = previewModel.alerts[activeInlineAlertId];
    setInlineAlertDraft(meta?.excerptText ?? '');
  }, [activeInlineAlertId, previewModel.alerts]);

  const goToField = (field: ReadmeFieldKey, toastText: string) => {
    setToast(toastText);
    focusFieldByReadmeKey(field);
  };

  const openPopoverAt = (anchor: DOMRect) => {
    setPopoverPos({
      top: Math.min(window.innerHeight - 16, anchor.bottom + 8),
      left: Math.min(window.innerWidth - 16, Math.max(16, anchor.left)),
    });
  };

  const licenseTodo = (anchor: DOMRect) => {
    const lines = previewModel.base.replace(/\r\n/g, '\n').split('\n');
    let offset = 0;
    for (const line of lines) {
      const start = offset;
      const end = start + line.length;
      offset += line.length + 1;
      if (/\blicen[sc]e\b/i.test(line) && /(to\s*do|fake|placeholder|http:\/\/|https:\/\/\S*fake)/i.test(line)) {
        setManualEditMeta({
          id: 'license-todo-manual',
          kind: 'license',
          excerptStart: start,
          excerptEnd: end,
          excerptText: line,
        });
        openPopoverAt(anchor);
        return;
      }
    }
    // Fallback: keep old guidance if we cannot map the source line safely.
    goToField('extraContext', licensePlaceholderToast);
  };

  const activeInlineMeta = activeInlineAlertId
    ? previewModel.alerts[activeInlineAlertId]
    : manualEditMeta ?? undefined;
  const closeInlinePopover = () => {
    setActiveInlineAlertId(null);
    setManualEditMeta(null);
    setPopoverPos(null);
  };

  const applyInlineEdit = () => {
    if (!activeInlineMeta) return;
    const before = previewModel.base.slice(0, activeInlineMeta.excerptStart);
    const after = previewModel.base.slice(activeInlineMeta.excerptEnd);
    onUpdateMarkdown(`${before}${inlineAlertDraft}${after}`);
    closeInlinePopover();
  };

  const deleteInlineExcerpt = () => {
    if (!activeInlineMeta) return;
    const before = previewModel.base.slice(0, activeInlineMeta.excerptStart);
    const after = previewModel.base.slice(activeInlineMeta.excerptEnd);
    const next = `${before}${after}`.replace(/\n{3,}/g, '\n\n');
    onUpdateMarkdown(next);
    closeInlinePopover();
  };

  return (
    <div className="relative">
      {toast ? (
        <div
          role="status"
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 right-4 z-50 rounded border border-zinc-600 bg-zinc-900 px-4 py-3 text-[15px] leading-relaxed text-zinc-200 shadow-lg sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm sm:text-sm"
        >
          {toast}
        </div>
      ) : null}
      {activeInlineMeta ? (
        <div className="fixed inset-0 z-50" onMouseDown={closeInlinePopover} role="presentation">
          <div
            className="absolute w-[min(92vw,34rem)] rounded border border-red-500/30 bg-zinc-950/95 p-3 shadow-xl"
            style={{
              top: popoverPos?.top ?? 80,
              left: popoverPos?.left ?? 16,
              transform: 'translateY(0)',
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-[15px] font-medium text-red-100 sm:text-sm">
                {t('inlineLicenseAlertTitle', { defaultValue: 'License mention looks wrong' })}
              </div>
              <button
                type="button"
                className="rounded px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-800/60"
                onClick={closeInlinePopover}
                aria-label={t('inlineAlertClose', { defaultValue: 'Close' })}
              >
                ×
              </button>
            </div>
            <p className="mt-1 text-[14px] leading-relaxed text-zinc-200/90 sm:text-sm">
              {t('inlineLicenseAlertBody', { defaultValue: 'Is there a real link for the license?' })}
            </p>
            <textarea
              className="mt-3 w-full resize-y rounded border border-zinc-700/60 bg-zinc-900/40 px-3 py-2 text-[14px] leading-relaxed text-zinc-100 outline-none focus:border-red-400/60 sm:text-sm"
              rows={4}
              value={inlineAlertDraft}
              onChange={(e) => setInlineAlertDraft(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                className="rounded border border-red-500/30 bg-red-950/35 px-3 py-2 text-[14px] font-medium text-red-100 hover:bg-red-950/55 sm:text-sm"
                onClick={deleteInlineExcerpt}
                aria-label={t('inlineAlertDelete', { defaultValue: 'Delete excerpt' })}
                title={t('inlineAlertDelete', { defaultValue: 'Delete excerpt' })}
              >
                {t('inlineAlertDelete', { defaultValue: 'Delete excerpt' })}
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded px-3 py-2 text-[14px] font-medium text-zinc-200 hover:bg-zinc-800/60 sm:text-sm"
                  onClick={closeInlinePopover}
                >
                  {t('inlineAlertCancel', { defaultValue: 'Cancel' })}
                </button>
                <button
                  type="button"
                  className="rounded bg-emerald-600/80 px-3 py-2 text-[14px] font-medium text-emerald-50 hover:bg-emerald-600 sm:text-sm"
                  onClick={applyInlineEdit}
                >
                  {t('inlineAlertApply', { defaultValue: 'Apply' })}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="max-w-none overflow-x-auto overflow-y-auto rounded border border-zinc-700/70 bg-zinc-950/90 p-3 [-webkit-overflow-scrolling:touch] sm:p-4">
        <div className="space-y-1">
          {previewModel.segments.map((seg, i) => {
            if (seg.type === 'warning') {
              if (seg.field !== 'extraContext') {
                return null;
              }
              return (
                <p key={`w-${i}`} className="readme-md my-1 text-[13px] text-red-200 sm:text-xs">
                  <ForgeWarningBlock
                    message={seg.message}
                    warningBlockTitle={t('warningBlockTitle')}
                    warningBannerLabel={t('warningBannerLabel')}
                    onGoToField={() => goToField(seg.field, placeholderToast)}
                  />
                </p>
              );
            }
            return (
              <MarkdownChunk
                key={`m-${i}`}
                content={seg.content}
                onLicenseTodo={licenseTodo}
                onInlineAlertClick={(id, anchor) => {
                  setManualEditMeta(null);
                  setActiveInlineAlertId(id);
                  openPopoverAt(anchor);
                }}
                licenseFallbackAlt={t('licenseFallbackAlt')}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
