import { useTranslation } from 'react-i18next';
import type { ReadmeLocale } from '../readmeLocale';

type Props = {
  value: ReadmeLocale;
  onChange: (v: ReadmeLocale) => void;
  disabled?: boolean;
};

const ORDER: ReadmeLocale[] = ['pt-BR', 'en', 'es'];

export function ReadmeLanguageSlider({ value, onChange, disabled }: Props) {
  const { t } = useTranslation();
  const d = disabled ?? false;

  const labelFor = (locale: ReadmeLocale) =>
    locale === 'pt-BR' ? t('readmeLangPt') : locale === 'en' ? t('readmeLangEn') : t('readmeLangEs');

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1">
        <span className="text-[13px] font-medium text-zinc-400 sm:text-xs">{t('readmeOutputLanguage')}</span>
        <div
          role="radiogroup"
          aria-label={t('readmeOutputLanguage')}
          className="inline-flex w-full rounded border border-zinc-600 bg-zinc-800/90 p-0.5 sm:w-auto"
        >
          {ORDER.map((locale) => {
            const active = value === locale;
            return (
              <button
                key={locale}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={t('readmeOutputAria', { lang: labelFor(locale) })}
                disabled={d}
                onClick={() => onChange(locale)}
                className={`min-h-11 min-w-0 flex-1 touch-manipulation rounded px-2 py-2 text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:min-w-[2.5rem] sm:flex-none sm:px-2.5 sm:py-1.5 sm:text-xs ${
                  active ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {labelFor(locale)}
              </button>
            );
          })}
        </div>
      </div>
      <p className="max-w-full text-[13px] leading-relaxed text-zinc-500 sm:max-w-xs sm:text-right sm:text-xs sm:leading-snug">
        {t('readmeOutputHint')}
      </p>
    </div>
  );
}
