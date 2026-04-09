type ForgeWarningBlockProps = {
  message: string;
  onGoToField: () => void;
  warningBlockTitle: string;
  warningBannerLabel: string;
};

const warnBoxClass =
  'inline-flex cursor-pointer items-center rounded bg-red-950/40 px-2 py-0.5 text-[13px] font-medium text-red-100 underline decoration-red-400/70 underline-offset-2 transition hover:bg-red-950/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 sm:text-xs';

export function ForgeWarningBlock({
  message,
  onGoToField,
  warningBlockTitle,
  warningBannerLabel,
}: ForgeWarningBlockProps) {
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
