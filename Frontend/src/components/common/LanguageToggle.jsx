// Frontend/src/components/common/LanguageToggle.jsx
import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Globe } from 'lucide-react';

export function LanguageToggle({ className = '', variant = 'pill' }) {
  const { language, setLanguage, isTamil } = useLanguage();

  if (variant === 'simple') {
    return (
      <div className={`inline-flex items-center rounded-lg border border-[#E7E5E4] bg-white p-0.5 text-xs font-bold ${className}`}>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
            !isTamil
              ? 'bg-[#F97316] text-white shadow-xs'
              : 'text-[#737373] hover:text-[#171717]'
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLanguage('ta')}
          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
            isTamil
              ? 'bg-[#F97316] text-white shadow-xs'
              : 'text-[#737373] hover:text-[#171717]'
          }`}
        >
          தமிழ்
        </button>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center bg-white border border-[#E7E5E4] rounded-full p-1 shadow-2xs">
        <Globe className="w-3.5 h-3.5 text-[#F97316] ml-1 mr-0.5 shrink-0" />
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            !isTamil
              ? 'bg-[#F97316] text-white shadow-xs'
              : 'text-[#737373] hover:text-[#171717]'
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage('ta')}
          className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            isTamil
              ? 'bg-[#F97316] text-white shadow-xs'
              : 'text-[#737373] hover:text-[#171717]'
          }`}
        >
          தமிழ்
        </button>
      </div>
    </div>
  );
}
