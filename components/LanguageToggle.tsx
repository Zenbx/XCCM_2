'use client'

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('fr')}
        className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${language === 'fr' ? 'bg-[#99334C] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        aria-label="FR"
        title="Français"
      >
        FR
      </button>
      <button
        onClick={() => {
          console.log('[LanguageToggle] click EN');
          setLanguage('en');
        }}
        className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${language === 'en' ? 'bg-[#99334C] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        aria-label="EN"
        title="English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
