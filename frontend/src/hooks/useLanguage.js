import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

const useLanguage = () => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = useCallback((language) => {
    i18n.changeLanguage(language);
    // No RTL changes - just change the language
  }, [i18n]);
  
  const currentLanguage = i18n.language;
  
  return {
    t,
    i18n,
    changeLanguage,
    currentLanguage
  };
};

export default useLanguage; 