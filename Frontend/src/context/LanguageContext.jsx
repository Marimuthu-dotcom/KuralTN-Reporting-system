// Frontend/src/context/LanguageContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../utils/translations';

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('civic_app_lang') || 'ta'; // Default to Tamil for TN citizens
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('civic_app_lang', lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ta' : 'en';
    setLanguage(nextLang);
  };

  const t = useCallback(
    (key) => {
      const dict = translations[language] || translations.en;
      return dict[key] || translations.en[key] || key;
    },
    [language]
  );

  const getStatusLabel = useCallback(
    (status) => {
      if (!status) return '—';
      const map = {
        'Pending Councillor Verification': 'statusPendingCouncillor',
        Submitted: 'statusSubmitted',
        'Forwarded to Department': 'statusForwardedToDept',
        Acknowledged: 'statusAcknowledged',
        'Under Review': 'statusUnderReview',
        'In Progress': 'statusInProgress',
        'Resolution Proposed': 'statusResolutionProposed',
        Resolved: 'statusResolved',
        Closed: 'statusClosed',
        Rejected: 'statusRejected',
      };
      const key = map[status];
      return key ? t(key) : status;
    },
    [t]
  );

  const getCategoryTitle = useCallback(
    (categoryId, defaultName) => {
      const map = {
        'cat-roads': 'catRoads',
        'cat-garbage': 'catGarbage',
        'cat-water': 'catWater',
        'cat-streetlights': 'catStreetlights',
        'cat-sewage': 'catSewage',
        'cat-toilets': 'catPublicToilets',
        'cat-parks': 'catParks',
        'cat-animals': 'catStrayAnimals',
        'cat-encroachment': 'catEncroachment',
        'cat-mosquito': 'catMosquito',
      };
      const key = map[categoryId];
      return key ? t(key) : defaultName;
    },
    [t]
  );

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    getStatusLabel,
    getCategoryTitle,
    isTamil: language === 'ta',
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
