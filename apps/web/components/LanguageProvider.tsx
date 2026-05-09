'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
  type ReactNode,
} from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { SUPPORTED_LANGUAGES, RTL_LANGUAGES, type SupportedLanguage } from '@babili/shared';

const LANG_KEY = 'babili_lang';
const DEFAULT_LANG: SupportedLanguage = 'en';

function readLangFromUrl(): SupportedLanguage | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang');
  if (lang && (SUPPORTED_LANGUAGES as readonly string[]).includes(lang)) {
    return lang as SupportedLanguage;
  }
  return null;
}

function readLangFromStorage(): SupportedLanguage | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(LANG_KEY);
  if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) {
    return stored as SupportedLanguage;
  }
  return null;
}

function resolveInitialLang(): SupportedLanguage {
  return readLangFromUrl() || readLangFromStorage() || DEFAULT_LANG;
}

interface LanguageContextType {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function LanguageProviderInner({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SupportedLanguage>(DEFAULT_LANG);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const resolved = resolveInitialLang();
    setLangState(resolved);
    setMounted(true);
  }, []);

  const queryLang = searchParams?.get('lang');
  useEffect(() => {
    if (!mounted) return;
    if (queryLang && (SUPPORTED_LANGUAGES as readonly string[]).includes(queryLang)) {
      setLangState(queryLang as SupportedLanguage);
      localStorage.setItem(LANG_KEY, queryLang);
    }
  }, [queryLang, pathname, mounted]);

  const dir = useMemo(
    () => ((RTL_LANGUAGES as readonly string[]).includes(lang) ? 'rtl' : 'ltr'),
    [lang],
  );

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem(LANG_KEY, lang);
  }, [lang, dir, mounted]);

  const setLang = useCallback((newLang: SupportedLanguage) => {
    setLangState(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, dir }}>{children}</LanguageContext.Provider>
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
