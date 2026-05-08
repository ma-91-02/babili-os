import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_LANGUAGES,
  RTL_LANGUAGES,
  BRAND_NAME,
  LANGUAGE_NAMES,
  isRTL,
  getDir,
} from '../constants';

describe('SUPPORTED_LANGUAGES', () => {
  it('contains exactly 25 languages', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(25);
  });

  it('includes all required languages', () => {
    const required = [
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
    ];
    for (const lang of required) {
      expect(SUPPORTED_LANGUAGES).toContain(lang);
    }
  });
});

describe('RTL_LANGUAGES', () => {
  it('contains exactly 4 languages', () => {
    expect(RTL_LANGUAGES).toHaveLength(4);
  });

  it('includes Arabic, Urdu, Persian, Hebrew', () => {
    expect(RTL_LANGUAGES).toContain('ar');
    expect(RTL_LANGUAGES).toContain('ur');
    expect(RTL_LANGUAGES).toContain('fa');
    expect(RTL_LANGUAGES).toContain('he');
  });
});

describe('BRAND_NAME', () => {
  it('has name in all 25 languages', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(BRAND_NAME[lang]).toBeDefined();
      expect(BRAND_NAME[lang]).not.toBe('');
    }
  });

  it('has correct Arabic name', () => {
    expect(BRAND_NAME.ar).toBe('بابلي');
  });

  it('has correct English name', () => {
    expect(BRAND_NAME.en).toBe('Babili');
  });

  it('has correct Chinese name', () => {
    expect(BRAND_NAME.zh).toBe('巴比利');
  });

  it('has correct Japanese name', () => {
    expect(BRAND_NAME.ja).toBe('バビリ');
  });

  it('has correct Korean name', () => {
    expect(BRAND_NAME.ko).toBe('바빌리');
  });

  it('has correct Hebrew name', () => {
    expect(BRAND_NAME.he).toBe('באבילי');
  });
});

describe('LANGUAGE_NAMES', () => {
  it('has names for all 25 languages', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(LANGUAGE_NAMES[lang]).toBeDefined();
      expect(LANGUAGE_NAMES[lang]).not.toBe('');
    }
  });
});

describe('isRTL', () => {
  it('returns true for Arabic', () => {
    expect(isRTL('ar')).toBe(true);
  });

  it('returns true for Urdu', () => {
    expect(isRTL('ur')).toBe(true);
  });

  it('returns false for English', () => {
    expect(isRTL('en')).toBe(false);
  });

  it('returns false for French', () => {
    expect(isRTL('fr')).toBe(false);
  });
});

describe('getDir', () => {
  it('returns rtl for Arabic', () => {
    expect(getDir('ar')).toBe('rtl');
  });

  it('returns ltr for English', () => {
    expect(getDir('en')).toBe('ltr');
  });
});
