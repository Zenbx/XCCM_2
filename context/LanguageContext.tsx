'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language } from '@/services/locales';

type LanguageContextType = {
  language: Language;
  setLanguage: (l: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('xccm2_language') as Language | null;
      console.log('[LanguageContext] init, stored:', stored);
      if (stored) setLanguage(stored);
      else {
        const nav = typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('en') ? 'en' : 'fr';
        console.log('[LanguageContext] init, navigator:', nav);
        setLanguage(nav as Language);
      }
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('xccm2_language', language);
      console.log('[LanguageContext] language changed to', language);
    } catch (err) {
      // ignore
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
