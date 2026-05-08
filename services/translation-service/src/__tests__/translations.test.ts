import { describe, it, expect } from 'vitest';
import { ALL_TRANSLATIONS, getTranslation, getTranslationsByCategory } from '../translations';
import { type SupportedLanguage } from '@babili/shared';
import { validateCoverage } from '../validator';

describe('ALL_TRANSLATIONS', () => {
  it('has at least 50 translation keys', () => {
    const keys = Object.keys(ALL_TRANSLATIONS);
    expect(keys.length).toBeGreaterThanOrEqual(50);
  });

  it('has common category keys', () => {
    const commonKeys = Object.keys(ALL_TRANSLATIONS).filter((k) => k.startsWith('common.'));
    expect(commonKeys.length).toBeGreaterThan(0);
  });

  it('has auth category keys', () => {
    const authKeys = Object.keys(ALL_TRANSLATIONS).filter((k) => k.startsWith('auth.'));
    expect(authKeys.length).toBeGreaterThan(0);
  });

  it('has nav category keys', () => {
    const navKeys = Object.keys(ALL_TRANSLATIONS).filter((k) => k.startsWith('nav.'));
    expect(navKeys.length).toBeGreaterThan(0);
  });

  it('has order category keys', () => {
    const orderKeys = Object.keys(ALL_TRANSLATIONS).filter((k) => k.startsWith('order.'));
    expect(orderKeys.length).toBeGreaterThan(0);
  });

  it('has admin and customer category keys', () => {
    const adminKeys = Object.keys(ALL_TRANSLATIONS).filter((k) => k.startsWith('admin.'));
    const customerKeys = Object.keys(ALL_TRANSLATIONS).filter((k) => k.startsWith('customer.'));
    expect(adminKeys.length).toBeGreaterThan(0);
    expect(customerKeys.length).toBeGreaterThan(0);
  });
});

describe('getTranslation', () => {
  it('returns translation for existing key', () => {
    const result = getTranslation('common.save', 'en');
    expect(result).toBe('Save');
  });

  it('returns Arabic translation', () => {
    const result = getTranslation('common.save', 'ar');
    expect(result).toBe('حفظ');
  });

  it('returns undefined for non-existent key', () => {
    const result = getTranslation('nonexistent.key', 'en');
    expect(result).toBeUndefined();
  });

  it('returns undefined for non-existent language', () => {
    const result = getTranslation('common.save', 'zz' as SupportedLanguage);
    expect(result).toBeUndefined();
  });
});

describe('getTranslationsByCategory', () => {
  it('returns all common translations in English', () => {
    const result = getTranslationsByCategory('common', 'en');
    expect(Object.keys(result).length).toBeGreaterThan(0);
    expect(result['common.save']).toBe('Save');
  });

  it('returns all auth translations in Arabic', () => {
    const result = getTranslationsByCategory('auth', 'ar');
    expect(Object.keys(result).length).toBeGreaterThan(0);
    expect(result['auth.login']).toBe('تسجيل الدخول');
  });
});

describe('Coverage validation', () => {
  it('passes full coverage check with no missing translations', () => {
    const report = validateCoverage();

    expect(report.totalKeys).toBeGreaterThan(0);
    expect(report.totalLanguages).toBe(25);
    expect(report.issues.length).toBe(0);
    expect(report.coveragePercent).toBe(100);
    expect(report.languagesWithFullCoverage.length).toBe(25);
  });
});
