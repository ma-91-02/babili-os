'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useLanguage } from '@/components/LanguageProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useOrderEvents } from '@/lib/sse';
import { t, getBrandName } from '../../lib/i18n';
import type { OrderEvent } from '@/lib/sse';
import styles from './restaurant.module.scss';

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

function RestaurantContent() {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const { events, connected } = useOrderEvents(user?.restaurantId ?? undefined);

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
        <div className={styles.content}>
          <div className="card">
            <h2>{getBrandName(lang)}</h2>
            <p>{t('common.loading', lang)}</p>
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
