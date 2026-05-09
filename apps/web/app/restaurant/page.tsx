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
import {
  MOCK_MENU_SECTIONS,
  MOCK_STAFF,
  MOCK_TABLES,
  getMockOverviewStats,
} from '@/lib/mock/restaurant-data';
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
  { key: 'ingredients', labelKey: 'restaurant.ingredients' },
  { key: 'promotions', labelKey: 'restaurant.promotions' },
  { key: 'settings', labelKey: 'nav.settings' },
];

function EventItem({ event }: { event: OrderEvent }) {
  const time = new Date(event.timestamp).toLocaleTimeString();
  const parts = event.type.split('.');
  const typeLabel = parts.length > 1 ? parts.slice(1).join(' › ') : event.type;
  const status = event.data.orderStatus;
  const shortId = event.orderId.slice(0, 8);

  return (
    <div className={styles.eventItem}>
      <span className={styles.eventTime}>{time}</span>
      <span className={styles.eventType}>{typeLabel}</span>
      <span className={styles.eventOrder}>#{shortId}</span>
      {typeof status === 'string' && <span className={styles.eventStatus}>{status}</span>}
    </div>
  );
}

function OverviewTab({ lang }: { lang: SupportedLanguage }) {
  const stats = getMockOverviewStats();
  return (
    <div className={styles.grid}>
      <div className="card">
        <h3>{t('nav.orders', lang)}</h3>
        <p className={styles.stat}>{stats.orders}</p>
        <p className={styles.statLabel}>{t('restaurant.activeOrders', lang)}</p>
      </div>
      <div className="card">
        <h3>{t('nav.tables', lang)}</h3>
        <p className={styles.stat}>{stats.tables}</p>
        <p className={styles.statLabel}>{t('restaurant.available', lang)}</p>
      </div>
      <div className="card">
        <h3>{t('nav.staff', lang)}</h3>
        <p className={styles.stat}>{stats.staff}</p>
        <p className={styles.statLabel}>{t('nav.staff', lang)}</p>
      </div>
      <div className="card">
        <h3>{t('nav.menu', lang)}</h3>
        <p className={styles.stat}>{stats.menuItems}</p>
        <p className={styles.statLabel}>{t('restaurant.menuItems', lang)}</p>
      </div>
    </div>
  );
}

function MenuTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div>
      <div className={styles.sectionHeader}>
        <h3>{t('nav.menu', lang)}</h3>
      </div>
      <div className={styles.menuGrid}>
        {MOCK_MENU_SECTIONS.map((section) => (
          <div key={section.id} className="card">
            <h4>{section.name}</h4>
            <p>
              {section.itemCount} {t('restaurant.menuItems', lang)}
            </p>
          </div>
        ))}
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
          <p>{t('restaurant.noOrders', lang)}</p>
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
          <h4>{t('restaurant.activeOrders', lang)}</h4>
          <p className={styles.stat}>0</p>
          <p className={styles.statLabel}>{t('restaurant.noOrders', lang)}</p>
        </div>
        <div className="card">
          <h4>{t('restaurant.readyOrders', lang)}</h4>
          <p className={styles.stat}>0</p>
          <p className={styles.statLabel}>{t('restaurant.readyOrders', lang)}</p>
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
          <p className={styles.statLabel}>{t('restaurant.unpaid', lang)}</p>
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
      </div>
      <div className={styles.tableGrid}>
        {MOCK_TABLES.map((table) => (
          <div key={table.id} className="card">
            <h4>
              {t('nav.tables', lang)} {table.number}
            </h4>
            <p className={styles.statLabel}>
              {table.status === 'available'
                ? t('restaurant.available', lang)
                : t('restaurant.occupied', lang)}
            </p>
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
            {MOCK_STAFF.map((member, i) => (
              <tr key={i}>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>{member.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlaceholderTab({ title }: { title: string }) {
  const { lang } = useLanguage();
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{t('common.loading', lang)}</p>
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
        return <PlaceholderTab title={t('restaurant.ingredients', lang)} />;
      case 'promotions':
        return <PlaceholderTab title={t('restaurant.promotions', lang)} />;
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
            {connected ? t('restaurant.live', lang) : t('restaurant.reconnecting', lang)}
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
