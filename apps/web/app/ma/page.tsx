'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useLanguage } from '@/components/LanguageProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { t, getBrandName } from '../../lib/i18n';
import type { SupportedLanguage } from '@babili/shared';
import styles from './ma.module.scss';

type Tab =
  | 'overview'
  | 'restaurants'
  | 'users'
  | 'plans'
  | 'countries'
  | 'translations'
  | 'health'
  | 'settings';

const tabs: { key: Tab; labelKey: string }[] = [
  { key: 'overview', labelKey: 'nav.dashboard' },
  { key: 'restaurants', labelKey: 'admin.restaurants' },
  { key: 'users', labelKey: 'admin.users' },
  { key: 'plans', labelKey: 'admin.plans' },
  { key: 'countries', labelKey: 'admin.countries' },
  { key: 'translations', labelKey: 'admin.translations' },
  { key: 'health', labelKey: 'admin.health' },
  { key: 'settings', labelKey: 'nav.settings' },
];

function OverviewTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div className={styles.grid}>
      <div className="card">
        <h3>{t('admin.restaurants', lang)}</h3>
        <p className={styles.stat}>1</p>
        <p className={styles.statLabel}>{t('common.loading', lang)}</p>
      </div>
      <div className="card">
        <h3>{t('admin.users', lang)}</h3>
        <p className={styles.stat}>6</p>
        <p className={styles.statLabel}>{t('common.loading', lang)}</p>
      </div>
      <div className="card">
        <h3>{t('admin.plans', lang)}</h3>
        <p className={styles.stat}>3</p>
        <p className={styles.statLabel}>{t('common.loading', lang)}</p>
      </div>
      <div className="card">
        <h3>{t('admin.countries', lang)}</h3>
        <p className={styles.stat}>1</p>
        <p className={styles.statLabel}>{t('common.loading', lang)}</p>
      </div>
    </div>
  );
}

function RestaurantsTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <h3>{t('admin.restaurants', lang)}</h3>
        <button className="btn btn-primary btn-sm">{t('common.save', lang)}</button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('common.search', lang)}</th>
            <th>{t('nav.settings', lang)}</th>
            <th>{t('nav.staff', lang)}</th>
            <th>{t('nav.dashboard', lang)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Babylon Bistro</td>
            <td>{t('common.loading', lang)}</td>
            <td>4</td>
            <td>
              <span className="badge badge-success">{t('common.confirm', lang)}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function UsersTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <h3>{t('admin.users', lang)}</h3>
        <button className="btn btn-primary btn-sm">{t('common.save', lang)}</button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('auth.email', lang)}</th>
            <th>{t('auth.name', lang)}</th>
            <th>{t('nav.settings', lang)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>admin@babili.dev</td>
            <td>Platform Admin</td>
            <td>platform_admin</td>
          </tr>
          <tr>
            <td>owner@babili.dev</td>
            <td>Restaurant Owner</td>
            <td>restaurant_owner</td>
          </tr>
          <tr>
            <td>manager@babili.dev</td>
            <td>Sarah Manager</td>
            <td>manager</td>
          </tr>
          <tr>
            <td>waiter@babili.dev</td>
            <td>Ahmed Waiter</td>
            <td>waiter</td>
          </tr>
          <tr>
            <td>kitchen@babili.dev</td>
            <td>Chef Karim</td>
            <td>kitchen</td>
          </tr>
          <tr>
            <td>cashier@babili.dev</td>
            <td>Layla Cashier</td>
            <td>cashier</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function PlansTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div className={styles.grid}>
      <div className="card">
        <h3>{t('admin.plans', lang)}</h3>
        <p className={styles.planName}>Starter</p>
        <p className={styles.statLabel}>{t('common.loading', lang)}</p>
      </div>
      <div className="card">
        <h3>{t('admin.plans', lang)}</h3>
        <p className={styles.planName}>Professional</p>
        <p className={styles.statLabel}>{t('common.loading', lang)}</p>
      </div>
      <div className="card">
        <h3>{t('admin.plans', lang)}</h3>
        <p className={styles.planName}>Enterprise</p>
        <p className={styles.statLabel}>{t('common.loading', lang)}</p>
      </div>
    </div>
  );
}

function CountriesTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <h3>{t('admin.countries', lang)}</h3>
        <button className="btn btn-primary btn-sm">{t('common.save', lang)}</button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('common.search', lang)}</th>
            <th>{t('admin.countries', lang)}</th>
            <th>{t('nav.settings', lang)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>EG</td>
            <td>Egypt</td>
            <td>EGP</td>
          </tr>
          <tr>
            <td>AE</td>
            <td>UAE</td>
            <td>AED</td>
          </tr>
          <tr>
            <td>SA</td>
            <td>Saudi Arabia</td>
            <td>SAR</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function TranslationsTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <h3>{t('admin.translations', lang)}</h3>
        <span className="badge badge-success">100%</span>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('common.search', lang)}</th>
            <th>{t('nav.dashboard', lang)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>common (7 keys)</td>
            <td>
              <span className="badge badge-success">100%</span>
            </td>
          </tr>
          <tr>
            <td>nav (9 keys)</td>
            <td>
              <span className="badge badge-success">100%</span>
            </td>
          </tr>
          <tr>
            <td>auth (12 keys)</td>
            <td>
              <span className="badge badge-success">100%</span>
            </td>
          </tr>
          <tr>
            <td>admin (5 keys)</td>
            <td>
              <span className="badge badge-success">100%</span>
            </td>
          </tr>
          <tr>
            <td>landing (6 keys)</td>
            <td>
              <span className="badge badge-success">100%</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

interface HealthStatus {
  service: string;
  status: 'ok' | 'down' | 'error';
  data: Record<string, unknown> | null;
}

interface HealthData {
  gateway: { status: string; uptime: number };
  services: HealthStatus[];
  overall: string;
}

function HealthTab({ lang }: { lang: SupportedLanguage }) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setHealth(d.data);
        else setHealth(null);
      })
      .catch(() => setHealth(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card">
        <p>{t('common.loading', lang)}</p>
      </div>
    );
  }

  const services = health?.services ?? [
    { service: 'api-gateway', status: 'down', data: null },
    { service: 'auth-service', status: 'down', data: null },
    { service: 'restaurant-service', status: 'down', data: null },
    { service: 'order-service', status: 'down', data: null },
    { service: 'translation-service', status: 'down', data: null },
  ];

  return (
    <div>
      <div className={styles.grid}>
        <div className="card">
          <h3>API Gateway</h3>
          <p className={styles.stat}>{health?.gateway?.status === 'ok' ? '✓' : '✗'}</p>
          <p className={styles.statLabel}>uptime: {Math.floor(health?.gateway?.uptime ?? 0)}s</p>
        </div>
        {services.map((svc) => (
          <div key={svc.service} className="card">
            <h3>{svc.service}</h3>
            <p
              className={`${styles.stat} ${svc.status === 'ok' ? styles.statOk : styles.statError}`}
            >
              {svc.status === 'ok' ? '✓' : '✗'}
            </p>
            <p className={styles.statLabel}>{svc.status}</p>
          </div>
        ))}
        <div className="card">
          <h3>{t('admin.health', lang)}</h3>
          <p
            className={`${styles.stat} ${health?.overall === 'healthy' ? styles.statOk : styles.statError}`}
          >
            {health?.overall === 'healthy' ? '✓' : '✗'}
          </p>
          <p className={styles.statLabel}>{health?.overall ?? 'unknown'}</p>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div className="card">
      <h3>{t('nav.settings', lang)}</h3>
      <p>{t('common.loading', lang)}</p>
    </div>
  );
}

function AdminContent() {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab lang={lang} />;
      case 'restaurants':
        return <RestaurantsTab lang={lang} />;
      case 'users':
        return <UsersTab lang={lang} />;
      case 'plans':
        return <PlansTab lang={lang} />;
      case 'countries':
        return <CountriesTab lang={lang} />;
      case 'translations':
        return <TranslationsTab lang={lang} />;
      case 'health':
        return <HealthTab lang={lang} />;
      case 'settings':
        return <SettingsTab lang={lang} />;
    }
  };

  return (
    <div className={styles.admin}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>{getBrandName(lang)}</div>
        <nav className={styles.nav}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.navItem} ${activeTab === tab.key ? styles.activeNav : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {t(tab.labelKey, lang)}
            </button>
          ))}
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
        <div className={styles.content}>{renderTab()}</div>
      </main>
    </div>
  );
}

export default function MAPage() {
  return (
    <AuthGuard allowedRoles={['platform_owner', 'platform_admin']}>
      <AdminContent />
    </AuthGuard>
  );
}
