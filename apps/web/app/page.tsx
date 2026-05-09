'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { t } from '../lib/i18n';
import styles from './page.module.scss';

export default function HomePage() {
  const { lang } = useLanguage();

  return (
    <div className={styles.landing}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon} />
          <span className={styles.logoText}>Babili</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/restaurant" className="btn btn-ghost">
            {t('nav.dashboard', lang)}
          </Link>
          <Link href="/staff" className="btn btn-ghost">
            {t('nav.staff', lang)}
          </Link>
          <Link href="/customer" className="btn btn-primary">
            {t('nav.platforms.customer', lang)}
          </Link>
          <LanguageSelector className={styles.langSelect} />
        </nav>
      </header>

      <main className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>{t('landing.badge', lang)}</div>
          <h1 className={styles.title}>{t('landing.title', lang)}</h1>
          <p className={styles.subtitle}>{t('landing.subtitle', lang)}</p>
          <div className={styles.cta}>
            <Link href="/customer" className="btn btn-primary">
              {t('landing.cta.order', lang)}
            </Link>
            <Link href="/restaurant" className="btn btn-secondary">
              {t('landing.cta.manage', lang)}
            </Link>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.pattern} />
          <div className={styles.geometricLine} />
          <div className={styles.geometricLine} />
          <div className={styles.geometricLine} />
        </div>
      </main>

      <footer className={styles.footer}>
        <p>{t('landing.footer', lang)}</p>
      </footer>
    </div>
  );
}
