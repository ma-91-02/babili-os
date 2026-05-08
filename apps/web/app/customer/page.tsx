import Link from 'next/link';
import { t, getBrandName, SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../lib/i18n';
import styles from './customer.module.scss';

export default function CustomerPage() {
  const lang: SupportedLanguage = 'en';

  return (
    <div className={styles.customer}>
      <header className={styles.header}>
        <div className={styles.logo}>{getBrandName(lang)}</div>
        <div className={styles.langSwitch}>
          <select defaultValue={lang}>
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className={styles.hero}>
        <div className={styles.scanArea}>
          <div className={styles.qrFrame}>
            <div className={styles.qrPlaceholder} />
          </div>
          <h1>{t('common.search', lang)}</h1>
          <p>{t('common.loading', lang)}</p>
        </div>
        <div className={styles.demoLink}>
          <p>{t('nav.menu', lang)}:</p>
          <Link href="/r/demo-restaurant" className="btn btn-primary">
            {t('nav.menu', lang)}
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          {getBrandName(lang)} — {t('nav.orders', lang)}
        </p>
      </footer>
    </div>
  );
}
