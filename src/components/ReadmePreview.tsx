import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { focusFieldByReadmeKey } from '../utils/readmePlaceholders';
import {
  isPlaceholderUrl,
  isPlaceholderText,
  prepareReadmePreviewMarkdown,
} from '../utils/readmePreviewMarkdown';
import { splitMarkdownWithForgeWarnings } from '../utils/readmeForgeWarnings';
import { generateExcerpt } from '../services/groq';
import { buildAlertifiedMarkdown, type InlineAlertMeta } from '../utils/readmeAlerts';
import type { GeneratorFormData, ReadmeLocale } from '../types';

import { MarkdownChunk } from './MarkdownChunk';
import { ForgeWarningBlock } from './ForgeWarningBlock';

type ReadmePreviewProps = {
  markdown: string;
  placeholderToast: string;
  licensePlaceholderToast: string;
  githubOwner?: string;
  githubRepo?: string;
  onUpdateMarkdown: (next: string) => void;
  formData?: GeneratorFormData;
  readmeLocale?: ReadmeLocale;
};

const TOAST_MS = 3200;

export function ReadmePreview({
  markdown,
  placeholderToast,
  githubOwner,
  githubRepo,
  onUpdateMarkdown,
  formData,
  readmeLocale,
}: ReadmePreviewProps) {
  const normalizedMarkdown = useMemo(() => markdown.replace(/\r\n/g, '\n'), [markdown]);
  const { t } = useTranslation();
  const [toast, setToast] = useState<string | null>(null);
  const [activeInlineAlertId, setActiveInlineAlertId] = useState<string | null>(null);
  const [manualEditMeta, setManualEditMeta] = useState<InlineAlertMeta | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const [inlineAlertDraft, setInlineAlertDraft] = useState<string>('');
  const [isGeneratingExcerpt, setIsGeneratingExcerpt] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [activeAnchorRect, setActiveAnchorRect] = useState<DOMRect | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const previewModel = useMemo(() => {
    const base = prepareReadmePreviewMarkdown(normalizedMarkdown, githubOwner, githubRepo);
    const alertified = buildAlertifiedMarkdown({ base, t });
    const segments = splitMarkdownWithForgeWarnings(alertified.markdown);
    return { base, segments, alerts: alertified.alerts };
  }, [normalizedMarkdown, githubOwner, githubRepo, t]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const meta = activeInlineAlertId ? previewModel.alerts[activeInlineAlertId] : manualEditMeta;
    if (meta) {
      setInlineAlertDraft(meta.excerptText);
    }
  }, [activeInlineAlertId, manualEditMeta, previewModel.alerts]);

  const goToField = (field: any, toastText: string) => {
    setToast(toastText);
    focusFieldByReadmeKey(field);
  };

  const computePopoverPos = (anchor: DOMRect) => {
    let top = anchor.bottom + 8;
    let left = anchor.left;
    const modalWidth = Math.min(window.innerWidth - 32, 544);
    const modalHeight = 280;

    if (top + modalHeight > window.innerHeight - 16) {
      top = Math.max(16, anchor.top - modalHeight - 8);
    }
    if (left + modalWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - modalWidth - 16);
    }
    return { top, left };
  };

  const openPopoverAt = (anchor: DOMRect) => {
    setActiveAnchorRect(anchor);
    setPopoverPos(computePopoverPos(anchor));
  };

  useEffect(() => {
    if (activeAnchorRect) {
      const el = document.querySelector(`[data-active-alert="true"]`);
      if (el) {
        setPopoverPos(computePopoverPos(el.getBoundingClientRect()));
      }
    }
  }, [scrollTop, activeAnchorRect]);

  const openManualEdit = (anchor: DOMRect, lineToFind?: string) => {
    const lines = previewModel.base.split('\n');
    let offset = 0;
    for (const line of lines) {
      const start = offset;
      const end = start + line.length;
      offset += line.length + 1;
      const isMatch = lineToFind ? line === lineToFind : isPlaceholderUrl(line) || isPlaceholderText(line);

      if (isMatch) {
        setInlineAlertDraft(line);
        setManualEditMeta({
          id: 'manual-edit-popover',
          kind: 'forge-aviso',
          excerptStart: start,
          excerptEnd: end,
          excerptText: line,
        });
        openPopoverAt(anchor);
        return;
      }
    }
    goToField('extraContext', placeholderToast);
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

  const autoGenerate = async () => {
    if (!activeInlineMeta || !formData || !readmeLocale) return;
    setIsGeneratingExcerpt(true);
    try {
      const field = activeInlineMeta.id.includes('aviso') ? activeInlineMeta.excerptText.split(':')[1] || 'content' : 'content';
      const result = await generateExcerpt(field, formData, readmeLocale);
      setInlineAlertDraft(result);
    } catch {
      setToast(t('errGenerate') || 'Error generating');
    } finally {
      setIsGeneratingExcerpt(false);
    }
  };

  const deleteInlineExcerpt = () => {
    if (!activeInlineMeta) return;
    const before = previewModel.base.slice(0, activeInlineMeta.excerptStart);
    const after = previewModel.base.slice(activeInlineMeta.excerptEnd);
    let next = (before + after).replace(/\n{3,}/g, '\n\n');
    if (next.startsWith('\n\n')) next = next.slice(2);
    onUpdateMarkdown(next);
    closeInlinePopover();
  };

  return (
    <div className="relative">
      {toast && (
        <div role="status" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 rounded border border-zinc-600 bg-zinc-900 px-4 py-3 text-[15px] text-zinc-200 shadow-lg sm:bottom-6 sm:right-6 sm:max-w-sm sm:text-sm">
          {toast}
        </div>
      )}

      {activeInlineMeta && (
        <div className="fixed inset-0 z-50" onMouseDown={closeInlinePopover} role="presentation">
          <div
            className="absolute z-50 w-[min(92vw,34rem)] rounded border border-red-500/30 bg-zinc-950/95 p-3 shadow-xl"
            style={{
              top: popoverPos?.top ?? 80,
              left: popoverPos?.left ?? 16,
              transition: 'top 0.1s ease-out, left 0.1s ease-out',
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-[15px] font-medium text-red-100 sm:text-sm">
                {activeInlineMeta.kind === 'forge-aviso' ? t('inlineForgeAvisoTitle') : t('inlineLicenseAlertTitle')}
              </div>
              <button type="button" className="rounded px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-800/60" onClick={closeInlinePopover}>
                ×
              </button>
            </div>
            <p className="mt-1 text-[14px] leading-relaxed text-zinc-200/90 sm:text-sm">
              {activeInlineMeta.kind === 'forge-aviso' ? t('inlineForgeAvisoBody') : t('inlineLicenseAlertBody')}
            </p>
            <textarea
              className="mt-3 w-full resize-y rounded border border-zinc-700/60 bg-zinc-900/40 px-3 py-2 text-[14px] text-zinc-100 outline-none focus:border-red-400/60 sm:text-sm"
              rows={4}
              value={inlineAlertDraft}
              onChange={(e) => setInlineAlertDraft(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button type="button" className="rounded border border-red-500/30 bg-red-950/35 px-3 py-2 text-sm font-medium text-red-100 hover:bg-red-950/55" onClick={deleteInlineExcerpt}>
                  {t('inlineAlertDelete')}
                </button>
                {formData && (
                  <button type="button" disabled={isGeneratingExcerpt} className="rounded border border-emerald-500/30 bg-emerald-950/20 px-3 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-900/40 disabled:opacity-50" onClick={autoGenerate}>
                    {isGeneratingExcerpt ? '...' : t('autoGenerate')}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="rounded px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800/60" onClick={closeInlinePopover}>
                  {t('inlineAlertCancel')}
                </button>
                <button type="button" className="rounded bg-emerald-600/80 px-3 py-2 text-sm font-medium text-emerald-50 hover:bg-emerald-600" onClick={applyInlineEdit}>
                  {t('inlineAlertApply')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        className="max-w-none overflow-x-auto overflow-y-auto rounded border border-zinc-700/70 bg-zinc-950/90 p-3 sm:p-4"
      >
        <div className="space-y-1">
          {previewModel.segments.map((seg, i) => {
            if (seg.type === 'warning') {
              if (seg.field !== 'extraContext') return null;
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
                onLicenseTodo={openManualEdit}
                onInlineAlertClick={(id, anchor) => {
                  setManualEditMeta(null);
                  setActiveInlineAlertId(id);
                  openPopoverAt(anchor);
                }}
                activeInlineAlertId={activeInlineAlertId}
                licenseFallbackAlt={t('licenseFallbackAlt')}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
