'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { t } from '../../lib/i18n';
import styles from './register.module.scss';

export default function RegisterPage() {
  const { lang } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, error } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError(t('auth.required', lang));
      return;
    }

    setSubmitting(true);
    try {
      await register({ name, email, password });
      router.push('/login');
    } catch {
      setFormError(error || t('auth.invalidCredentials', lang));
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
          <h1 className={styles.title}>{t('auth.createAccount', lang)}</h1>
          <p className={styles.subtitle}>{t('auth.signUp', lang)}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              {t('auth.name', lang)}
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.name', lang)}
              autoComplete="name"
              disabled={submitting}
            />
          </div>

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
              autoComplete="new-password"
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
            {submitting ? t('common.loading', lang) : t('auth.createAccount', lang)}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.switch}>
            {t('auth.hasAccount', lang)} <Link href="/login">{t('auth.signIn', lang)}</Link>
          </p>
        </div>

        <div className={styles.langPicker}>
          <LanguageSelector className={styles.langSelect} />
        </div>
      </div>
    </div>
  );
}
