import * as React from 'react';

export type Language = 'az' | 'en';

interface ILanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = React.createContext<ILanguageContextValue>({
  lang: 'az',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = React.useState<Language>('az');

  React.useEffect(() => {
    // Runs on mount only — reads persisted lang from localStorage after SSR
    try {
      const stored = localStorage.getItem('ec-lang') as Language;
      if (stored === 'az' || stored === 'en') setLang(stored);
    } catch {}
  }, []);

  const handleSetLang = (l: Language) => {
    setLang(l);
    try {
      localStorage.setItem('ec-lang', l);
    } catch {}
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return React.useContext(LanguageContext);
}
