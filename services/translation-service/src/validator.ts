import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@babili/shared';
import { ALL_TRANSLATIONS } from './translations';

export interface CoverageIssue {
  key: string;
  missingLanguages: SupportedLanguage[];
  totalMissing: number;
}

export interface CoverageReport {
  totalKeys: number;
  totalLanguages: number;
  totalExpected: number;
  totalPresent: number;
  coveragePercent: number;
  issues: CoverageIssue[];
  languagesWithFullCoverage: SupportedLanguage[];
  languagesWithMissingKeys: { lang: SupportedLanguage; missing: number }[];
}

export function validateCoverage(): CoverageReport {
  const totalKeys = Object.keys(ALL_TRANSLATIONS).length;
  const totalLanguages = SUPPORTED_LANGUAGES.length;
  const totalExpected = totalKeys * totalLanguages;

  let totalPresent = 0;
  const issues: CoverageIssue[] = [];
  const languageMissingCount: Record<string, number> = {};

  for (const lang of SUPPORTED_LANGUAGES) {
    languageMissingCount[lang] = 0;
  }

  for (const [key, entry] of Object.entries(ALL_TRANSLATIONS)) {
    const missingLanguages: SupportedLanguage[] = [];

    for (const lang of SUPPORTED_LANGUAGES) {
      if (entry.translations[lang]) {
        totalPresent++;
      } else {
        missingLanguages.push(lang);
        languageMissingCount[lang]!++;
      }
    }

    if (missingLanguages.length > 0) {
      issues.push({ key, missingLanguages, totalMissing: missingLanguages.length });
    }
  }

  const coveragePercent =
    totalExpected > 0 ? Math.round((totalPresent / totalExpected) * 100 * 100) / 100 : 0;

  const languagesWithFullCoverage: SupportedLanguage[] = [];
  const languagesWithMissingKeys: { lang: SupportedLanguage; missing: number }[] = [];

  for (const lang of SUPPORTED_LANGUAGES) {
    const missing = languageMissingCount[lang] ?? 0;
    if (missing === 0) {
      languagesWithFullCoverage.push(lang);
    } else {
      languagesWithMissingKeys.push({ lang, missing });
    }
  }

  return {
    totalKeys,
    totalLanguages,
    totalExpected,
    totalPresent,
    coveragePercent,
    issues,
    languagesWithFullCoverage,
    languagesWithMissingKeys,
  };
}

export function assertFullCoverage(): void {
  const report = validateCoverage();

  if (report.issues.length > 0) {
    const issueList = report.issues
      .slice(0, 10)
      .map(
        (i) =>
          `  - ${i.key}: missing ${i.totalMissing} languages (${i.missingLanguages.join(', ')})`,
      )
      .join('\n');

    throw new Error(
      `Translation coverage incomplete (${report.coveragePercent}%):\n` +
        `${report.totalPresent}/${report.totalExpected} translations present\n` +
        `${report.issues.length} keys have missing translations\n` +
        `Top issues:\n${issueList}`,
    );
  }
}
