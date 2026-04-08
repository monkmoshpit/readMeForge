import { useTranslation } from 'react-i18next';
import type { Tone } from '../types';

type Props = {
  value: Tone;
  onChange: (tone: Tone) => void;
  disabled?: boolean;
};

export function ToneSelector({ value, onChange, disabled }: Props) {
  const { t } = useTranslation();
  const d = disabled ?? false;

  const options: { id: Tone; labelKey: 'toneTechnical' | 'toneCasual' | 'toneRecruiter' }[] = [
    { id: 'technical', labelKey: 'toneTechnical' },
    { id: 'casual', labelKey: 'toneCasual' },
    { id: 'recruiter', labelKey: 'toneRecruiter' },
  ];

  return (
    <div>
      <p className="mb-2 text-[15px] font-medium text-zinc-300 sm:text-sm">{t('toneTitle')}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {options.map((opt) => (
          <label
            key={opt.id}
            className={`flex min-h-11 cursor-pointer items-center justify-center rounded border px-4 py-2 text-[15px] transition touch-manipulation sm:min-h-0 sm:justify-start sm:px-3 sm:py-1.5 sm:text-sm ${
              value === opt.id
                ? 'border-emerald-600/80 bg-emerald-950/40 text-emerald-100'
                : 'border-zinc-600/70 bg-zinc-900/50 text-zinc-300 hover:border-zinc-500'
            } ${d ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <input
              type="radio"
              name="tone"
              value={opt.id}
              checked={value === opt.id}
              onChange={() => onChange(opt.id)}
              className="sr-only"
            />
            {t(opt.labelKey)}
          </label>
        ))}
      </div>
    </div>
  );
}
