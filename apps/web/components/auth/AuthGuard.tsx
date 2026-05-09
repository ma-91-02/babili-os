'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  fallback?: ReactNode;
}

export function AuthGuard({ children, allowedRoles, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const { lang } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: '#6b7280',
        }}
      >
        {t('common.loading', lang)}
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (fallback) return <>{fallback}</>;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h1>{t('auth.accessDenied', lang)}</h1>
        <p style={{ color: '#6b7280' }}>{t('auth.accessDeniedMessage', lang)}</p>
      </div>
    );
  }

  return <>{children}</>;
}
