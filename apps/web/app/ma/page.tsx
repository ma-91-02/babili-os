'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useLanguage } from '@/components/LanguageProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { t, getBrandName } from '../../lib/i18n';
import type { SupportedLanguage } from '@babili/shared';
import {
  MOCK_RESTAURANTS,
  MOCK_USERS,
  MOCK_PLANS,
  MOCK_COUNTRIES,
  MOCK_TRANSLATION_CATEGORIES,
  getMockOverviewStats,
} from '@/lib/mock/ma-data';
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
  const stats = getMockOverviewStats(lang);
  return (
    <div className={styles.grid}>
      <div className="card">
        <h3>{t('admin.restaurants', lang)}</h3>
        <p className={styles.stat}>{stats.restaurants}</p>
        <p className={styles.statLabel}>{t('nav.dashboard', lang)}</p>
      </div>
      <div className="card">
        <h3>{t('admin.users', lang)}</h3>
        <p className={styles.stat}>{stats.users}</p>
        <p className={styles.statLabel}>{t('nav.staff', lang)}</p>
      </div>
      <div className="card">
        <h3>{t('admin.plans', lang)}</h3>
        <p className={styles.stat}>{stats.plans}</p>
        <p className={styles.statLabel}>{t('common.search', lang)}</p>
      </div>
      <div className="card">
        <h3>{t('admin.countries', lang)}</h3>
        <p className={styles.stat}>{stats.countries}</p>
        <p className={styles.statLabel}>{t('admin.countries', lang)}</p>
      </div>
    </div>
  );
}

function RestaurantsTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <h3>{t('admin.restaurants', lang)}</h3>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('auth.name', lang)}</th>
            <th>{t('nav.staff', lang)}</th>
            <th>{t('nav.dashboard', lang)}</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_RESTAURANTS.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.staffCount}</td>
              <td>
                <span
                  className={`badge ${r.status === 'active' ? 'badge-success' : 'badge-warning'}`}
                >
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
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
          {MOCK_USERS.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.name}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlansTab({ lang: _lang }: { lang: SupportedLanguage }) {
  return (
    <div className={styles.grid}>
      {MOCK_PLANS.map((plan) => (
        <div key={plan.name} className="card">
          <h3>{plan.name}</h3>
          <p className={styles.planName}>${plan.price}/mo</p>
          <p className={styles.statLabel}>{plan.description}</p>
        </div>
      ))}
    </div>
  );
}

function CountriesTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <h3>{t('admin.countries', lang)}</h3>
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
          {MOCK_COUNTRIES.map((c) => (
            <tr key={c.code}>
              <td>{c.code}</td>
              <td>{c.name}</td>
              <td>{c.currency}</td>
            </tr>
          ))}
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
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('common.search', lang)}</th>
            <th>{t('nav.dashboard', lang)}</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_TRANSLATION_CATEGORIES.map((cat) => (
            <tr key={cat.name}>
              <td>
                {cat.name} ({cat.keyCount} keys)
              </td>
              <td>
                <span
                  className={`badge ${cat.coverage === 100 ? 'badge-success' : 'badge-warning'}`}
                >
                  {cat.coverage}%
                </span>
              </td>
            </tr>
          ))}
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setHealth(d.data);
        else setHealth(null);
      })
      .catch(() => {
        setError(t('admin.health', lang));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card">
        <p>{t('common.loading', lang)}</p>
      </div>
    );
  }

  const services = health?.services ?? [];

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
        {services.length === 0 && (
          <div className="card">
            <h3>{t('admin.health', lang)}</h3>
            <p className={`${styles.stat} ${styles.statError}`}>✗</p>
            <p className={styles.statLabel}>{error || t('common.loading', lang)}</p>
          </div>
        )}
        {services.length > 0 && (
          <div className="card">
            <h3>{t('admin.health', lang)}</h3>
            <p
              className={`${styles.stat} ${health?.overall === 'healthy' ? styles.statOk : styles.statError}`}
            >
              {health?.overall === 'healthy' ? '✓' : '✗'}
            </p>
            <p className={styles.statLabel}>{health?.overall ?? 'unknown'}</p>
          </div>
        )}
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
