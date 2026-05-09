'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useLanguage } from '@/components/LanguageProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useOrderEvents } from '@/lib/sse';
import { t, getBrandName } from '../../lib/i18n';
import type { SupportedLanguage } from '@babili/shared';
import type { OrderEvent } from '@/lib/sse';
import styles from './staff.module.scss';

type Tab = 'overview' | 'orders' | 'kitchen' | 'cashier' | 'tables';
type StaffRole = 'waiter' | 'kitchen' | 'cashier' | 'manager' | 'viewer';

const roleTabs: Record<StaffRole, Tab[]> = {
  waiter: ['overview', 'orders', 'tables'],
  kitchen: ['overview', 'kitchen'],
  cashier: ['overview', 'cashier'],
  manager: ['overview', 'orders', 'kitchen', 'cashier', 'tables'],
  viewer: ['overview'],
};

const tabLabels: Record<Tab, string> = {
  overview: 'nav.dashboard',
  orders: 'nav.orders',
  kitchen: 'nav.kitchen',
  cashier: 'nav.cashier',
  tables: 'nav.tables',
};

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

function OverviewTab({ lang, events }: { lang: SupportedLanguage; events: OrderEvent[] }) {
  return (
    <div>
      <div className={styles.grid}>
        <div className="card">
          <h3>{t('nav.orders', lang)}</h3>
          <p className={styles.stat}>{events.length}</p>
          <p className={styles.statLabel}>{t('common.loading', lang)}</p>
        </div>
        <div className="card">
          <h3>{t('nav.tables', lang)}</h3>
          <p className={styles.stat}>5</p>
          <p className={styles.statLabel}>{t('nav.dashboard', lang)}</p>
        </div>
      </div>
      <div className={styles.eventFeed}>
        <h3>{t('nav.orders', lang)}</h3>
        {events.length === 0 ? (
          <p className={styles.noEvents}>{t('common.loading', lang)}</p>
        ) : (
          <div className={styles.eventList}>
            {events.map((event, i) => (
              <EventItem key={`${event.orderId}-${i}`} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersTab({ lang }: { lang: SupportedLanguage }) {
  return (
    <div>
      <div className={styles.sectionHeader}>
        <h3>{t('nav.orders', lang)}</h3>
        <button className="btn btn-primary btn-sm">{t('common.save', lang)}</button>
      </div>
      <div className={styles.grid}>
        <div className="card">
          <h4>{t('nav.orders', lang)}</h4>
          <p className={styles.stat}>0</p>
          <p className={styles.statLabel}>{t('nav.dashboard', lang)}</p>
        </div>
      </div>
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
          <h4>{t('nav.kitchen', lang)}</h4>
          <p className={styles.stat}>0</p>
          <p className={styles.statLabel}>{t('nav.orders', lang)}</p>
        </div>
      </div>
      <div className={styles.kanban}>
        <div className={`${styles.kanbanColumn} card`}>
          <h4>{t('nav.kitchen', lang)}</h4>
          <p className={styles.noEvents}>{t('common.loading', lang)}</p>
        </div>
        <div className={`${styles.kanbanColumn} card`}>
          <h4>{t('nav.orders', lang)}</h4>
          <p className={styles.noEvents}>{t('common.loading', lang)}</p>
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
          <h4>{t('nav.cashier', lang)}</h4>
          <p className={styles.stat}>0</p>
          <p className={styles.statLabel}>{t('nav.orders', lang)}</p>
        </div>
        <div className="card">
          <h4>{t('nav.cashier', lang)}</h4>
          <p className={styles.stat}>0</p>
          <p className={styles.statLabel}>{t('common.loading', lang)}</p>
        </div>
      </div>
      <div className={styles.kanban}>
        <div className={`${styles.kanbanColumn} card`}>
          <h4>{t('nav.cashier', lang)}</h4>
          <p className={styles.noEvents}>{t('common.loading', lang)}</p>
        </div>
        <div className={`${styles.kanbanColumn} card`}>
          <h4>{t('nav.cashier', lang)}</h4>
          <p className={styles.noEvents}>{t('common.loading', lang)}</p>
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

function StaffContent() {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const { events, connected } = useOrderEvents(user?.restaurantId ?? undefined);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const allowedTabs = useMemo(() => {
    const role = (user?.role ?? 'viewer') as StaffRole;
    return roleTabs[role] ?? roleTabs.viewer;
  }, [user?.role]);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab lang={lang} events={events} />;
      case 'orders':
        return <OrdersTab lang={lang} />;
      case 'kitchen':
        return <KitchenTab lang={lang} />;
      case 'cashier':
        return <CashierTab lang={lang} />;
      case 'tables':
        return <TablesTab lang={lang} />;
    }
  };

  return (
    <div className={styles.staff}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>{getBrandName(lang)}</div>
        <nav className={styles.nav}>
          {allowedTabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.navItem} ${activeTab === tab ? styles.activeNav : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {t(tabLabels[tab], lang)}
            </button>
          ))}
        </nav>
        <div className={styles.langPicker}>
          <LanguageSelector />
        </div>
        <div className={styles.sidebarFooter}>
          <span className={styles.userInfo}>{user?.email}</span>
          <span className={styles.roleBadge}>{user?.role}</span>
          <button onClick={logout} className={styles.logoutBtn}>
            {t('auth.logout', lang)}
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>{t('nav.staff', lang)}</h1>
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

export default function StaffPage() {
  return (
    <AuthGuard allowedRoles={['waiter', 'kitchen', 'cashier', 'manager']}>
      <StaffContent />
    </AuthGuard>
  );
}
