'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations } from '@/services/locales';
import { NextIntlClientProvider } from 'next-intl';

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
      if (stored) setLanguage(stored);
      else {
        const nav = typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('en') ? 'en' : 'fr';
        setLanguage(nav as Language);
      }
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('xccm2_language', language);
    } catch (err) {
      // ignore
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <NextIntlClientProvider locale={language} messages={translations[language]}>
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
