import { createContext, useContext, useState, useCallback } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem('appLanguage') || 'EN'
  );

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    localStorage.setItem('appLanguage', lang);
    document.documentElement.lang = lang.toLowerCase();
  }, []);

  // t('navbar.cart') -> translations[language].navbar.cart
  const t = useCallback((key) => {
    const parts = key.split('.');
    let value = translations[language];
    for (const part of parts) {
      if (value === undefined) return key;
      value = value[part];
    }
    return value ?? key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be inside LanguageProvider');
  return context;
};
