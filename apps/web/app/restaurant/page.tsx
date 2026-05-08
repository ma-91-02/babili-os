import { t, getBrandName } from '../../lib/i18n';
import styles from './restaurant.module.scss';

export default function RestaurantPage() {
  const lang = 'en';

  return (
    <div className={styles.restaurant}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>{getBrandName(lang)}</div>
        <nav className={styles.nav}>
          <span className={styles.navItem}>{t('nav.dashboard', lang)}</span>
          <span className={styles.navItem}>{t('nav.menu', lang)}</span>
          <span className={styles.navItem}>{t('nav.orders', lang)}</span>
          <span className={styles.navItem}>{t('nav.kitchen', lang)}</span>
          <span className={styles.navItem}>{t('nav.cashier', lang)}</span>
          <span className={styles.navItem}>{t('nav.tables', lang)}</span>
          <span className={styles.navItem}>{t('nav.staff', lang)}</span>
          <span className={styles.navItem}>{t('nav.settings', lang)}</span>
        </nav>
      </aside>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>{t('nav.dashboard', lang)}</h1>
        </header>
        <div className={styles.content}>
          <div className="card">
            <h2>{getBrandName(lang)}</h2>
            <p>{t('common.loading', lang)}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
