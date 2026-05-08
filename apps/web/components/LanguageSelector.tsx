'use client';

import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, type SupportedLanguage } from '@babili/shared';
import { useLanguage } from './LanguageProvider';

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const { lang, setLang } = useLanguage();

  return (
    <select
      className={className}
      value={lang}
      onChange={(e) => setLang(e.target.value as SupportedLanguage)}
    >
      {SUPPORTED_LANGUAGES.map((l) => (
        <option key={l} value={l}>
          {LANGUAGE_NAMES[l]}
        </option>
      ))}
    </select>
  );
}
