import { useTranslation } from 'react-i18next';
import type { ProjectType } from '../types';

type Props = {
  value: ProjectType;
  onChange: (v: ProjectType) => void;
  disabled?: boolean;
};

export function TemplateSelector({ value, onChange, disabled }: Props) {
  const { t } = useTranslation();
  const d = disabled ?? false;

  const OPTIONS: {
    id: ProjectType;
    labelKey: 'tplOpensource' | 'tplSaas' | 'tplApi' | 'tplPortfolio' | 'tplCli' | 'tplFullstack';
    hintKey:
      | 'tplOpensourceHint'
      | 'tplSaasHint'
      | 'tplApiHint'
      | 'tplPortfolioHint'
      | 'tplCliHint'
      | 'tplFullstackHint';
  }[] = [
    { id: 'opensource', labelKey: 'tplOpensource', hintKey: 'tplOpensourceHint' },
    { id: 'saas', labelKey: 'tplSaas', hintKey: 'tplSaasHint' },
    { id: 'api', labelKey: 'tplApi', hintKey: 'tplApiHint' },
    { id: 'portfolio', labelKey: 'tplPortfolio', hintKey: 'tplPortfolioHint' },
    { id: 'cli', labelKey: 'tplCli', hintKey: 'tplCliHint' },
    { id: 'fullstack', labelKey: 'tplFullstack', hintKey: 'tplFullstackHint' },
  ];

  return (
    <div>
      <p className="mb-2 text-[15px] font-medium text-zinc-300 sm:text-sm">{t('templateTitle')}</p>
      <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 lg:grid-cols-3">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            disabled={d}
            onClick={() => onChange(o.id)}
            className={`touch-manipulation rounded border px-3 py-2.5 text-left text-[15px] transition sm:py-2 sm:text-sm ${
              value === o.id
                ? 'border-emerald-500 bg-emerald-950/40 text-white'
                : 'border-zinc-600/80 bg-zinc-900/60 text-zinc-300 hover:border-zinc-500'
            } disabled:opacity-50`}
          >
            <span className="font-medium">{t(o.labelKey)}</span>
            <span className="mt-0.5 block text-[13px] leading-snug text-zinc-500 sm:text-xs">{t(o.hintKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
