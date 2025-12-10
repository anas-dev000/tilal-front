import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    supportedLngs: ['en', 'ar', 'bn'],
    
    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },

    resources: {
      en: {
        translation: await fetch('/locales/en/translation.json').then(res => res.json())
      },
      ar: {
        translation: await fetch('/locales/ar/translation.json').then(res => res.json())
      },
      bn: {
        translation: await fetch('/locales/bn/translation.json').then(res => res.json())
      }
    }
  });

// Set document direction based on language
i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lng);
});

// Set initial direction
const currentLang = i18n.language || 'en';
document.documentElement.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
document.documentElement.setAttribute('lang', currentLang);

export default i18n;

