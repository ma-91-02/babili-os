'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { t, getBrandName } from '../../lib/i18n';
import styles from './staff.module.scss';

function StaffContent() {
  const { user, logout } = useAuth();
  const lang = 'en';

  return (
    <div className={styles.staff}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>{getBrandName(lang)}</div>
        <nav className={styles.nav}>
          <span className={styles.navItem}>{t('nav.dashboard', lang)}</span>
          <span className={styles.navItem}>{t('nav.orders', lang)}</span>
          <span className={styles.navItem}>{t('nav.kitchen', lang)}</span>
          <span className={styles.navItem}>{t('nav.cashier', lang)}</span>
          <span className={styles.navItem}>{t('nav.tables', lang)}</span>
        </nav>
        <div className={styles.sidebarFooter}>
          <span className={styles.userInfo}>{user?.email}</span>
          <button onClick={logout} className={styles.logoutBtn}>
            {t('auth.logout', lang)}
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>{t('nav.staff', lang)}</h1>
        </header>
        <div className={styles.content}>
          <div className="card">
            <h2>{t('nav.staff', lang)}</h2>
            <p>{t('common.loading', lang)}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function StaffPage() {
  return (
    <AuthGuard allowedRoles={['waiter', 'kitchen', 'cashier', 'manager']}>
      <StaffContent />
    </AuthGuard>
  );
}
