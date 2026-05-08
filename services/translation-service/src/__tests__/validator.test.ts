import { describe, it, expect } from 'vitest';
import { validateCoverage, assertFullCoverage } from '../validator';

describe('validateCoverage', () => {
  it('returns 100% coverage when all keys have all languages', () => {
    const report = validateCoverage();

    expect(report.totalKeys).toBeGreaterThan(0);
    expect(report.coveragePercent).toBe(100);
    expect(report.totalPresent).toBe(report.totalExpected);
  });

  it('has full coverage for all languages', () => {
    const report = validateCoverage();
    expect(report.languagesWithFullCoverage.length).toBe(25);
  });

  it('has no missing keys', () => {
    const report = validateCoverage();
    expect(report.issues.length).toBe(0);
  });

  it('reports correct structure', () => {
    const report = validateCoverage();
    expect(report).toHaveProperty('totalKeys');
    expect(report).toHaveProperty('totalLanguages');
    expect(report).toHaveProperty('totalExpected');
    expect(report).toHaveProperty('totalPresent');
    expect(report).toHaveProperty('coveragePercent');
    expect(report).toHaveProperty('issues');
    expect(report).toHaveProperty('languagesWithFullCoverage');
    expect(report).toHaveProperty('languagesWithMissingKeys');
  });
});

describe('assertFullCoverage', () => {
  it('does not throw when coverage is complete', () => {
    expect(() => assertFullCoverage()).not.toThrow();
  });
});
