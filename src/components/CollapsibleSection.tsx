import { useState, type ReactNode } from 'react';

type Props = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function CollapsibleSection({ title, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      className="group rounded-md border border-zinc-700/50 bg-zinc-900/35 [&_summary::-webkit-details-marker]:hidden"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-[15px] font-medium text-zinc-300 touch-manipulation hover:bg-zinc-800/30 sm:min-h-0 sm:text-sm">
        <span>{title}</span>
        <span
          className="shrink-0 text-zinc-500 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        >
          ▼
        </span>
      </summary>
      <div className="border-t border-zinc-700/40 px-3 pb-3 pt-3">{children}</div>
    </details>
  );
}
