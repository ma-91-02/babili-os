import Link from 'next/link';
import { t, getBrandName, SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../../lib/i18n';
import styles from './restaurantSlug.module.scss';

export default async function RestaurantSlugPage(props: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const params = await props.params;
  const lang: SupportedLanguage = 'en';
  const restaurantName = params.restaurantSlug.replace(/-/g, ' ');

  return (
    <div className={styles.page}>
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

      <main className={styles.content}>
        <div className={styles.restaurantInfo}>
          <h1>{restaurantName}</h1>
          <p className={styles.tagline}>{t('nav.menu', lang)}</p>
        </div>

        <div className={styles.menuPreview}>
          <div className="card">
            <div
              className="skeleton"
              style={{ height: '1rem', width: '60%', marginBottom: '0.75rem' }}
            />
            <div className="skeleton" style={{ height: '0.75rem', width: '40%' }} />
          </div>
          <div className="card">
            <div
              className="skeleton"
              style={{ height: '1rem', width: '50%', marginBottom: '0.75rem' }}
            />
            <div className="skeleton" style={{ height: '0.75rem', width: '35%' }} />
          </div>
          <div className="card">
            <div
              className="skeleton"
              style={{ height: '1rem', width: '55%', marginBottom: '0.75rem' }}
            />
            <div className="skeleton" style={{ height: '0.75rem', width: '45%' }} />
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/customer" className="btn btn-primary">
            {t('nav.menu', lang)}
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>{t('common.loading', lang)}</p>
      </footer>
    </div>
  );
}
