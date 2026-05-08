'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useLanguage } from '@/components/LanguageProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { t, getBrandName } from '../../lib/i18n';
import styles from './admin.module.scss';

function AdminContent() {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();

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
        <div className={styles.langPicker}>
          <LanguageSelector />
        </div>
        <div className={styles.sidebarFooter}>
          <span className={styles.userInfo}>{user?.email}</span>
          <button onClick={logout} className={styles.logoutBtn}>
            {t('auth.logout', lang)}
          </button>
        </div>
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

export default function AdminPage() {
  return (
    <AuthGuard allowedRoles={['platform_owner', 'platform_admin']}>
      <AdminContent />
    </AuthGuard>
  );
}
