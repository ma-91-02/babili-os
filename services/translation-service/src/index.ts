import express from 'express';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@babili/shared';
import { ALL_TRANSLATIONS, getTranslation, getTranslationsByCategory } from './translations';
import { validateCoverage, assertFullCoverage } from './validator';

const app = express();
const PORT = process.env.PORT || 4004;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'translation-service', timestamp: new Date().toISOString() });
});

app.get('/api/v1/translations', (req, res) => {
  const lang = (req.query.lang as string) || 'en';

  if (!SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
    res.status(400).json({ success: false, error: `Unsupported language: ${lang}` });
    return;
  }

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(ALL_TRANSLATIONS)) {
    const translation = entry.translations[lang as SupportedLanguage];
    if (translation) {
      result[key] = translation;
    }
  }

  res.json({ success: true, data: { language: lang, translations: result } });
});

app.get('/api/v1/translations/:key', (req, res) => {
  const lang = (req.query.lang as string) || 'en';
  const { key } = req.params;

  if (!SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
    res.status(400).json({ success: false, error: `Unsupported language: ${lang}` });
    return;
  }

  const translation = getTranslation(key, lang as SupportedLanguage);
  if (!translation) {
    res.status(404).json({ success: false, error: `Translation not found for key: ${key}` });
    return;
  }

  res.json({ success: true, data: { key, language: lang, translation } });
});

app.get('/api/v1/translations/category/:category', (req, res) => {
  const lang = (req.query.lang as string) || 'en';
  const { category } = req.params;

  if (!SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
    res.status(400).json({ success: false, error: `Unsupported language: ${lang}` });
    return;
  }

  const translations = getTranslationsByCategory(category, lang as SupportedLanguage);
  res.json({ success: true, data: { category, language: lang, translations } });
});

app.get('/api/v1/languages', (_req, res) => {
  res.json({
    success: true,
    data: {
      languages: SUPPORTED_LANGUAGES,
      count: SUPPORTED_LANGUAGES.length,
    },
  });
});

app.get('/api/v1/coverage', (_req, res) => {
  const report = validateCoverage();
  res.json({ success: true, data: report });
});

app.post('/api/v1/coverage/assert', (_req, res) => {
  try {
    assertFullCoverage();
    res.json({ success: true, data: { message: 'Full coverage confirmed' } });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`Translation Service running on port ${PORT}`);
});

export default app;
