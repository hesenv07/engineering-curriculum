import * as React from 'react';

import { useLanguage } from '@/context/LanguageContext';
import type { Language } from '@/context/LanguageContext';

type TLanguageOption = {
  code: Language | string;
  label: string;
  isSoon?: boolean;
};

const LANGUAGES: TLanguageOption[] = [
  { code: 'az', label: 'Azərbaycanca' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский', isSoon: true },
  { code: 'tr', label: 'Türkçe', isSoon: true },
];

const LanguageSelector = () => {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLabel = lang.toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-[#404756] dark:text-[#99A1B3] hover:bg-[#F6F7F9] dark:hover:bg-[#343A46] hover:text-[#23272F] dark:hover:text-[#F6F7F9] transition-colors"
        aria-label="Dil seçin"
        aria-expanded={isOpen}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <span className="font-medium">{currentLabel}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#2B3245] border border-[#EBECF0] dark:border-[#343A46] rounded-xl shadow-lg overflow-hidden z-50">
          <div className="p-1">
            {LANGUAGES.map((l) => (
              <div key={l.code}>
                {l.isSoon ? (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[#99A1B3] cursor-not-allowed select-none">
                    <span>{l.label}</span>
                    <span className="text-[10px] bg-[#F6F7F9] dark:bg-[#343A46] text-[#99A1B3] rounded px-1.5 py-0.5 font-medium">
                      tezliklə
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setLang(l.code as Language);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      lang === l.code
                        ? 'bg-[#EDF5FA] dark:bg-[#1A3344] text-[#087EA4] dark:text-[#149ECA] font-semibold'
                        : 'text-[#404756] dark:text-[#99A1B3] hover:bg-[#F6F7F9] dark:hover:bg-[#343A46]'
                    }`}
                  >
                    {l.label}
                    {lang === l.code && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
