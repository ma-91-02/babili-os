import { t, getBrandName } from '../../lib/i18n';
import styles from './admin.module.scss';

export default function AdminPage() {
  const lang = 'en';

  return (
    <div className={styles.admin}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>{getBrandName(lang)}</div>
        <nav className={styles.nav}>
          <span className={styles.navItem}>{t('nav.dashboard', lang)}</span>
          <span className={styles.navItem}>{t('admin.restaurants', lang)}</span>
          <span className={styles.navItem}>{t('admin.users', lang)}</span>
          <span className={styles.navItem}>{t('nav.settings', lang)}</span>
        </nav>
      </aside>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>{t('admin.title', lang)}</h1>
        </header>
        <div className={styles.content}>
          <div className="card">
            <h2>{t('admin.title', lang)}</h2>
            <p>{t('common.loading', lang)}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
