import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import es from './locales/es/translation.json';
import en from './locales/en/translation.json';
import pt from './locales/pt/translation.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      'pt-BR': { translation: pt },
      es: { translation: es },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt', 'pt-BR', 'es'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['navigator', 'htmlTag'],
      caches: [],
    },
  })
  .then(() => {
    document.documentElement.lang = i18n.language;
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
