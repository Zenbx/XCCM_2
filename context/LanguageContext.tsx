'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/services/locales';

type LanguageContextType = {
  language: Language;
  setLanguage: (l: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr');
  const router = useRouter();

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
      document.cookie = `NEXT_LOCALE=${language}; path=/; max-age=31536000`;
      router.refresh(); // Force server-side re-render when language changes
    } catch (err) {
      // ignore
    }
  }, [language, router]);

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
