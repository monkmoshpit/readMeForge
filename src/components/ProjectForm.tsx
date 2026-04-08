import { useTranslation } from 'react-i18next';
import type { ProjectData } from '../types';

type Props = {
  projectData: ProjectData;
  onChange: (patch: Partial<ProjectData>) => void;
  disabled?: boolean;
};

export function ProjectGithubFields({ projectData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  const d = disabled ?? false;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="field-name" className="mb-1.5 block text-[15px] font-medium text-zinc-300 sm:text-sm">
          {t('fieldName')}
        </label>
        <input
          id="field-name"
          type="text"
          value={projectData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          disabled={d}
          className="min-h-11 w-full rounded border border-zinc-600/70 bg-zinc-900/80 px-3 py-2.5 text-base text-slate-100 focus:border-emerald-600/70 focus:outline-none focus:ring-2 focus:ring-emerald-600/25 disabled:opacity-50"
        />
      </div>
      <div>
        <label htmlFor="field-description" className="mb-1.5 block text-[15px] font-medium text-zinc-300 sm:text-sm">
          {t('fieldDescription')}
        </label>
        <textarea
          id="field-description"
          value={projectData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          disabled={d}
          rows={3}
          className="min-h-[5.5rem] w-full resize-y rounded border border-zinc-600/70 bg-zinc-900/80 px-3 py-2.5 text-base leading-relaxed text-slate-100 focus:border-emerald-600/70 focus:outline-none focus:ring-2 focus:ring-emerald-600/25 disabled:opacity-50"
        />
      </div>
      <div>
        <label htmlFor="field-homepage" className="mb-1.5 block text-[15px] font-medium text-zinc-300 sm:text-sm">
          {t('fieldHomepage')}
        </label>
        <input
          id="field-homepage"
          type="url"
          inputMode="url"
          value={projectData.homepage ?? ''}
          onChange={(e) => onChange({ homepage: e.target.value || undefined })}
          disabled={d}
          className="min-h-11 w-full rounded border border-zinc-600/70 bg-zinc-900/80 px-3 py-2.5 text-base text-slate-100 focus:border-emerald-600/70 focus:outline-none focus:ring-2 focus:ring-emerald-600/25 disabled:opacity-50"
        />
      </div>
      <div>
        <label htmlFor="field-stars" className="mb-1.5 block text-[15px] font-medium text-zinc-300 sm:text-sm">
          {t('fieldStars')}
        </label>
        <input
          id="field-stars"
          type="text"
          readOnly
          value={projectData.stars != null ? String(projectData.stars) : ''}
          className="min-h-11 w-full cursor-not-allowed rounded border border-zinc-700/60 bg-zinc-950/50 px-3 py-2.5 text-base text-zinc-400"
        />
      </div>
      <div>
        <label htmlFor="field-languages" className="mb-1.5 block text-[15px] font-medium text-zinc-300 sm:text-sm">
          {t('fieldLanguages')}
        </label>
        <input
          id="field-languages"
          type="text"
          value={projectData.languages.join(', ')}
          onChange={(e) =>
            onChange({
              languages: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          disabled={d}
          className="min-h-11 w-full rounded border border-zinc-600/70 bg-zinc-900/80 px-3 py-2.5 text-base text-slate-100 focus:border-emerald-600/70 focus:outline-none focus:ring-2 focus:ring-emerald-600/25 disabled:opacity-50"
        />
      </div>
      <div>
        <label htmlFor="field-topics" className="mb-1.5 block text-[15px] font-medium text-zinc-300 sm:text-sm">
          {t('fieldTopics')}
        </label>
        <input
          id="field-topics"
          type="text"
          value={projectData.topics.join(', ')}
          onChange={(e) =>
            onChange({
              topics: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          disabled={d}
          className="min-h-11 w-full rounded border border-zinc-600/70 bg-zinc-900/80 px-3 py-2.5 text-base text-slate-100 focus:border-emerald-600/70 focus:outline-none focus:ring-2 focus:ring-emerald-600/25 disabled:opacity-50"
        />
      </div>
    </div>
  );
}

export function ExtraContextField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const d = disabled ?? false;
  return (
    <div>
      <label htmlFor="field-extraContext" className="mb-1.5 block text-[15px] font-medium text-zinc-300 sm:text-sm">
        {t('fieldExtra')}
      </label>
      <textarea
        id="field-extraContext"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={d}
        rows={4}
        className="min-h-[7rem] w-full resize-y rounded border border-zinc-600/70 bg-zinc-900/80 px-3 py-2.5 text-base leading-relaxed text-slate-100 focus:border-emerald-600/70 focus:outline-none focus:ring-2 focus:ring-emerald-600/25 disabled:opacity-50"
      />
    </div>
  );
}
