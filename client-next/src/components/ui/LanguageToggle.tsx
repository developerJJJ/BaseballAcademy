"use client";

import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ko' : 'en')}
      className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
      aria-label="Toggle Language"
    >
      <Globe className="w-4 h-4 text-slate-500" />
      <span className="text-sm font-bold text-slate-700 w-6 text-center">
        {language === 'en' ? 'EN' : 'KR'}
      </span>
    </button>
  );
}
