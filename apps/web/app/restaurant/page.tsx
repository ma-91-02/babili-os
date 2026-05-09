'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useLanguage } from '@/components/LanguageProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useOrderEvents } from '@/lib/sse';
import { t, getBrandName } from '../../lib/i18n';
import type { SupportedLanguage } from '@babili/shared';
import type { OrderEvent } from '@/lib/sse';
import styles from './restaurant.module.scss';

type Tab =
  | 'overview'
  | 'menu'
  | 'orders'
  | 'kitchen'
  | 'cashier'
  | 'tables'
  | 'staff'
  | 'ingredients'
  | 'promotions'
  | 'settings';

const tabs: { key: Tab; labelKey: string }[] = [
  { key: 'overview', labelKey: 'nav.dashboard' },
  { key: 'menu', labelKey: 'nav.menu' },
  { key: 'orders', labelKey: 'nav.orders' },
  { key: 'kitchen', labelKey: 'nav.kitchen' },
  { key: 'cashier', labelKey: 'nav.cashier' },
  { key: 'tables', labelKey: 'nav.tables' },
  { key: 'staff', labelKey: 'nav.staff' },
  { key: 'ingredients', labelKey: 'nav.staff' },
  { key: 'promotions', labelKey: 'nav.dashboard' },
  { key: 'settings', labelKey: 'nav.settings' },
];

function EventItem({ event }: { event: OrderEvent }) {
  const time = new Date(event.timestamp).toLocaleTimeString();
  const typeLabel = event.type.replace('order.', '').replace('.', ' → ');
  const status = event.data.orderStatus;

  return (
    <div className={styles.eventItem}>
      <span className={styles.eventTime}>{time}</span>
      <span className={styles.eventType}>{typeLabel}</span>
      <span className={styles.eventOrder}>#{event.orderId.slice(0, 8)}</span>
      {typeof status === 'string' && <span className={styles.eventStatus}>{status}</span>}
    </div>
  );
}

function OverviewTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div className={styles.grid}>
      <div className="card">
        <h3>{t('nav.orders', lang)}</h3>
        <p className={styles.stat}>12</p>
        <p className={styles.statLabel}>{t('common.loading', lang)}</p>
      </div>
      <div className="card">
        <h3>{t('nav.tables', lang)}</h3>
        <p className={styles.stat}>5</p>
        <p className={styles.statLabel}>{t('nav.dashboard', lang)}</p>
      </div>
      <div className="card">
        <h3>{t('nav.staff', lang)}</h3>
        <p className={styles.stat}>4</p>
        <p className={styles.statLabel}>{t('nav.menu', lang)}</p>
      </div>
      <div className="card">
        <h3>{t('nav.menu', lang)}</h3>
        <p className={styles.stat}>14</p>
        <p className={styles.statLabel}>{t('common.loading', lang)}</p>
      </div>
    </div>
  );
}

function MenuTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div>
      <div className={styles.sectionHeader}>
        <h3>{t('nav.menu', lang)}</h3>
        <button className="btn btn-primary btn-sm">{t('common.save', lang)}</button>
      </div>
      <div className={styles.menuGrid}>
        <div className="card">
          <h4>Appetizers</h4>
          <p>3 {t('nav.menu', lang)}</p>
        </div>
        <div className="card">
          <h4>Main Course</h4>
          <p>4 {t('nav.menu', lang)}</p>
        </div>
        <div className="card">
          <h4>Desserts</h4>
          <p>3 {t('nav.menu', lang)}</p>
        </div>
        <div className="card">
          <h4>Beverages</h4>
          <p>4 {t('nav.menu', lang)}</p>
        </div>
      </div>
    </div>
  );
}

function OrdersTab({ lang, events }: { lang: SupportedLanguage; events: OrderEvent[] }) {
  return (
    <div>
      <div className={styles.sectionHeader}>
        <h3>{t('nav.orders', lang)}</h3>
      </div>
      {events.length === 0 ? (
        <div className="card">
          <p>{t('common.loading', lang)}</p>
        </div>
      ) : (
        <div className={styles.eventList}>
          {events.map((event, i) => (
            <EventItem key={`${event.orderId}-${i}`} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function KitchenTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div>
      <div className={styles.sectionHeader}>
        <h3>{t('nav.kitchen', lang)}</h3>
      </div>
      <div className={styles.grid}>
        <div className="card">
          <h4>{t('nav.orders', lang)}</h4>
          <p className={styles.stat}>0</p>
          <p className={styles.statLabel}>{t('common.loading', lang)}</p>
        </div>
        <div className="card">
          <h4>{t('nav.orders', lang)}</h4>
          <p className={styles.stat}>0</p>
          <p className={styles.statLabel}>{t('nav.kitchen', lang)}</p>
        </div>
      </div>
    </div>
  );
}

function CashierTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div>
      <div className={styles.sectionHeader}>
        <h3>{t('nav.cashier', lang)}</h3>
      </div>
      <div className={styles.grid}>
        <div className="card">
          <h4>{t('nav.orders', lang)}</h4>
          <p className={styles.stat}>0</p>
          <p className={styles.statLabel}>{t('nav.cashier', lang)}</p>
        </div>
      </div>
    </div>
  );
}

function TablesTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div>
      <div className={styles.sectionHeader}>
        <h3>{t('nav.tables', lang)}</h3>
        <button className="btn btn-primary btn-sm">{t('common.save', lang)}</button>
      </div>
      <div className={styles.tableGrid}>
        {[1, 2, 3, 4, 5].map((num) => (
          <div key={num} className="card">
            <h4>
              {t('nav.tables', lang)} {num}
            </h4>
            <p className={styles.statLabel}>{t('nav.dashboard', lang)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StaffTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div>
      <div className={styles.sectionHeader}>
        <h3>{t('nav.staff', lang)}</h3>
        <button className="btn btn-primary btn-sm">{t('common.save', lang)}</button>
      </div>
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('auth.name', lang)}</th>
              <th>{t('auth.email', lang)}</th>
              <th>{t('nav.staff', lang)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Restaurant Owner</td>
              <td>owner@babili.dev</td>
              <td>restaurant_owner</td>
            </tr>
            <tr>
              <td>Sarah Manager</td>
              <td>manager@babili.dev</td>
              <td>manager</td>
            </tr>
            <tr>
              <td>Ahmed Waiter</td>
              <td>waiter@babili.dev</td>
              <td>waiter</td>
            </tr>
            <tr>
              <td>Chef Karim</td>
              <td>kitchen@babili.dev</td>
              <td>kitchen</td>
            </tr>
            <tr>
              <td>Layla Cashier</td>
              <td>cashier@babili.dev</td>
              <td>cashier</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{t('common.loading', title === 'common.loading' ? 'en' : 'en')}</p>
    </div>
  );
}

function RestaurantContent() {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const { events, connected } = useOrderEvents(user?.restaurantId ?? undefined);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab lang={lang} />;
      case 'menu':
        return <MenuTab lang={lang} />;
      case 'orders':
        return <OrdersTab lang={lang} events={events} />;
      case 'kitchen':
        return <KitchenTab lang={lang} />;
      case 'cashier':
        return <CashierTab lang={lang} />;
      case 'tables':
        return <TablesTab lang={lang} />;
      case 'staff':
        return <StaffTab lang={lang} />;
      case 'ingredients':
        return <PlaceholderTab title={t('nav.menu', lang)} />;
      case 'promotions':
        return <PlaceholderTab title={t('nav.dashboard', lang)} />;
      case 'settings':
        return <PlaceholderTab title={t('nav.settings', lang)} />;
    }
  };

  return (
    <div className={styles.restaurant}>
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
          <h1>{t('nav.dashboard', lang)}</h1>
          <div className={styles.connectionStatus}>
            <span className={connected ? styles.connected : styles.disconnected} />
            {connected ? 'Live' : 'Reconnecting...'}
          </div>
        </header>
        <div className={styles.content}>{renderTab()}</div>
      </main>
    </div>
  );
}

export default function RestaurantPage() {
  return (
    <AuthGuard
      allowedRoles={['restaurant_owner', 'manager', 'cashier', 'kitchen', 'waiter', 'viewer']}
    >
      <RestaurantContent />
    </AuthGuard>
  );
}
