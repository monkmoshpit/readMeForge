import { useTranslation } from 'react-i18next';
import { ReadmePreview } from './ReadmePreview';
import type { GeneratorFormData, ReadmeLocale } from '../types';

type PreviewContentProps = {
  hasAnyReadme: boolean;
  genStatus: string;
  activeReadme?: string;
  formData: GeneratorFormData;
  readmeLocale: ReadmeLocale;
  apiKey: string | null;
  onUpdateActiveReadme: (next: string) => void;
};

export function PreviewContent({
  hasAnyReadme,
  genStatus,
  activeReadme,
  formData,
  readmeLocale,
  apiKey,
  onUpdateActiveReadme,
}: PreviewContentProps) {
  const { t } = useTranslation();

  if (!hasAnyReadme && genStatus !== 'generating') {
    return (
      <p className="text-[15px] leading-relaxed text-zinc-400 sm:text-sm sm:text-zinc-500">
        {t('previewEmpty')}
      </p>
    );
  }

  if (genStatus === 'generating' && !activeReadme) {
    return (
      <p className="text-[15px] leading-relaxed text-zinc-400 sm:text-sm sm:text-zinc-500">
        {t('previewGeneratingThisLocale')}
      </p>
    );
  }

  if (activeReadme) {
    return (
      <ReadmePreview
        markdown={activeReadme}
        placeholderToast={t('placeholderToast')}
        licensePlaceholderToast={t('licensePlaceholderToast')}
        githubOwner={formData.projectData.githubOwner}
        githubRepo={formData.projectData.githubRepo}
        onUpdateMarkdown={onUpdateActiveReadme}
        formData={formData}
        readmeLocale={readmeLocale}
        apiKey={apiKey}
      />
    );
  }

  if (hasAnyReadme) {
    return (
      <p className="text-[15px] leading-relaxed text-amber-200/90 sm:text-sm">
        {t('previewMissingThisLocale')}
      </p>
    );
  }

  return (
    <p className="text-[15px] leading-relaxed text-zinc-400 sm:text-sm sm:text-zinc-500">
      {t('previewEmpty')}
    </p>
  );
}
