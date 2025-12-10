import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const currentLanguage = i18n.language || 'en';
  const isRTL = currentLanguage === 'ar';

  const value = {
    currentLanguage,
    changeLanguage,
    isRTL,
    languages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    ],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

