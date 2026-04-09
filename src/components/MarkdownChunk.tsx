import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { isPlaceholderUrl, isPlaceholderText } from '../utils/readmePreviewMarkdown';

type MarkdownChunkProps = {
  content: string;
  onLicenseTodo: (anchor: DOMRect) => void;
  onInlineAlertClick: (alertId: string, anchor: DOMRect) => void;
  licenseFallbackAlt: string;
  activeInlineAlertId?: string | null;
};

const warnBoxClass =
  'inline-flex cursor-pointer items-center rounded bg-red-950/40 px-2 py-0.5 text-[13px] font-medium text-red-100 underline decoration-red-400/70 underline-offset-2 transition hover:bg-red-950/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 sm:text-xs';

const inlineAlertClass =
  'inline-flex cursor-pointer items-center rounded bg-red-500/15 px-1 py-0.5 text-[13px] font-medium text-red-50 underline decoration-red-300/70 underline-offset-2 transition hover:bg-red-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 sm:text-xs';

export function MarkdownChunk({
  content,
  onLicenseTodo,
  licenseFallbackAlt,
  onInlineAlertClick,
  activeInlineAlertId,
}: MarkdownChunkProps) {
  return (
    <div className="readme-md max-w-none">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ href, children, ...rest }) => {
            if (href && href.startsWith('forge-alert://')) {
              const url = new URL(href);
              const id = url.searchParams.get('id') ?? '';
              const isBlock = url.searchParams.get('style') === 'block';
              const alertId = decodeURIComponent(id);
              return (
                <span
                  role="button"
                  tabIndex={0}
                  data-active-alert={activeInlineAlertId === alertId ? 'true' : undefined}
                  className={isBlock ? warnBoxClass : inlineAlertClass}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (id) onInlineAlertClick(alertId, e.currentTarget.getBoundingClientRect());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (id) onInlineAlertClick(alertId, e.currentTarget.getBoundingClientRect());
                    }
                  }}
                >
                  {children}
                </span>
              );
            }

            const childrenText = typeof children === 'string' ? children : '';
            const isPlaceholder = (href && isPlaceholderUrl(href)) || isPlaceholderText(childrenText);

            if (isPlaceholder) {
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
            if (isPlaceholderUrl(s)) {
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
