'use client';

import { createContext, useContext, useState, useEffect, useCallback, Suspense, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  SUPPORTED_LANGUAGES,
  RTL_LANGUAGES,
  type SupportedLanguage,
} from '@babili/shared';

const LANG_KEY = 'babili_lang';

function getInitialLang(): SupportedLanguage {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) {
      return stored as SupportedLanguage;
    }
  }
  return 'en';
}

interface LanguageContextType {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function LanguageProviderInner({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const queryLang = searchParams?.get('lang');

  const [lang, setLangState] = useState<SupportedLanguage>(() => {
    if (queryLang && (SUPPORTED_LANGUAGES as readonly string[]).includes(queryLang)) {
      return queryLang as SupportedLanguage;
    }
    return getInitialLang();
  });

  const dir = (RTL_LANGUAGES as readonly string[]).includes(lang) ? 'rtl' : 'ltr';

  useEffect(() => {
    if (queryLang && (SUPPORTED_LANGUAGES as readonly string[]).includes(queryLang)) {
      const ql = queryLang as SupportedLanguage;
      setLangState(ql);
      localStorage.setItem(LANG_KEY, ql);
    }
  }, [queryLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem(LANG_KEY, lang);
  }, [lang, dir]);

  const setLang = useCallback((newLang: SupportedLanguage) => {
    setLangState(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <LanguageProviderInner>{children}</LanguageProviderInner>
    </Suspense>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
