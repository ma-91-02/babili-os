export const SUPPORTED_LANGUAGES = [
  'ar',
  'en',
  'ru',
  'tr',
  'fr',
  'es',
  'de',
  'it',
  'pt',
  'zh',
  'ja',
  'ko',
  'hi',
  'ur',
  'fa',
  'he',
  'id',
  'ms',
  'uk',
  'pl',
  'nl',
  'sv',
  'el',
  'vi',
  'th',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const RTL_LANGUAGES: readonly SupportedLanguage[] = ['ar', 'ur', 'fa', 'he'];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  ar: 'العربية',
  en: 'English',
  ru: 'Русский',
  tr: 'Türkçe',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  hi: 'हिन्दी',
  ur: 'اردو',
  fa: 'فارسی',
  he: 'עברית',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
  uk: 'Українська',
  pl: 'Polski',
  nl: 'Nederlands',
  sv: 'Svenska',
  el: 'Ελληνικά',
  vi: 'Tiếng Việt',
  th: 'ไทย',
};

export const BRAND_NAME: Record<SupportedLanguage, string> = {
  ar: 'بابلي',
  en: 'Babili',
  ru: 'Бабили',
  tr: 'Babili',
  fr: 'Babili',
  es: 'Babili',
  de: 'Babili',
  it: 'Babili',
  pt: 'Babili',
  zh: '巴比利',
  ja: 'バビリ',
  ko: '바빌리',
  hi: 'बाबिली',
  ur: 'بابلی',
  fa: 'بابلی',
  he: 'באבילי',
  id: 'Babili',
  ms: 'Babili',
  uk: 'Бабілі',
  pl: 'Babili',
  nl: 'Babili',
  sv: 'Babili',
  el: 'Μπαμπίλι',
  vi: 'Babili',
  th: 'บาบิลี',
};

export function isRTL(lang: string): boolean {
  return (RTL_LANGUAGES as readonly string[]).includes(lang);
}

export function getDir(lang: string): 'rtl' | 'ltr' {
  return isRTL(lang) ? 'rtl' : 'ltr';
}
