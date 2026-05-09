'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { t } from '../../lib/i18n';
import styles from './login.module.scss';

function LoginForm() {
  const { lang } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const platformRoles = ['platform_admin', 'platform_owner'];
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !password.trim()) {
      setFormError(t('auth.required', lang));
      return;
    }

    setSubmitting(true);
    try {
      const userData = await login(email, password);
      const defaultPath = platformRoles.includes(userData.role) ? '/ma' : '/restaurant';
      const redirectTo = searchParams.get('redirect') || defaultPath;
      router.push(redirectTo);
    } catch (err) {
      setFormError((err as Error)?.message || t('auth.invalidCredentials', lang));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon} />
            <span className={styles.logoText}>Babili</span>
          </div>
          <h1 className={styles.title}>{t('auth.login', lang)}</h1>
          <p className={styles.subtitle}>{t('auth.welcomeBack', lang)}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              {t('auth.email', lang)}
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              {t('auth.password', lang)}
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={submitting}
            />
          </div>

          {formError && (
            <div className={styles.error} role="alert">
              {formError}
            </div>
          )}

          <button
            type="submit"
            className={`btn btn-primary ${styles.submit}`}
            disabled={submitting}
          >
            {submitting ? t('common.loading', lang) : t('auth.login', lang)}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.switch}>
            {t('auth.noAccount', lang)} <Link href="/register">{t('auth.signUp', lang)}</Link>
          </p>
        </div>

        <div className={styles.langPicker}>
          <LanguageSelector className={styles.langSelect} />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <div className={styles.card}>
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
