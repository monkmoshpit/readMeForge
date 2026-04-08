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
};

const TOAST_MS = 3200;

const warnBoxClass =
  'inline-flex cursor-pointer items-center rounded bg-red-950/40 px-2 py-0.5 text-[13px] font-medium text-red-100 underline decoration-red-400/70 underline-offset-2 transition hover:bg-red-950/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 sm:text-xs';

type ChunkProps = {
  content: string;
  onLicenseTodo: () => void;
};

function MarkdownChunk({
  content,
  onLicenseTodo,
  licenseFallbackAlt,
}: ChunkProps & { licenseFallbackAlt: string }) {
  return (
    <div className="readme-md max-w-none">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ href, children, ...rest }) => {
            if (href && isLicenseUrlWithTodo(href)) {
              return (
                <span
                  role="button"
                  tabIndex={0}
                  className={warnBoxClass}
                  onClick={(e) => {
                    e.preventDefault();
                    onLicenseTodo();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onLicenseTodo();
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
                    onLicenseTodo();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onLicenseTodo();
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
}: Props) {
  const { t } = useTranslation();
  const [toast, setToast] = useState<string | null>(null);

  const segments = useMemo(() => {
    const processed = prepareReadmePreviewMarkdown(markdown, githubOwner, githubRepo);
    return splitMarkdownWithForgeWarnings(processed);
  }, [markdown, githubOwner, githubRepo]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const goToField = (field: ReadmeFieldKey, toastText: string) => {
    setToast(toastText);
    focusFieldByReadmeKey(field);
  };

  const licenseTodo = () => {
    goToField('extraContext', licensePlaceholderToast);
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
      <div className="max-w-none overflow-x-auto overflow-y-auto rounded border border-zinc-700/70 bg-zinc-950/90 p-3 [-webkit-overflow-scrolling:touch] sm:p-4">
        <div className="space-y-1">
          {segments.map((seg, i) => {
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
                licenseFallbackAlt={t('licenseFallbackAlt')}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
