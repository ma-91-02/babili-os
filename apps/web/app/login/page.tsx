'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/i18n';
import styles from './login.module.scss';

function LoginForm() {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !password.trim()) {
      setFormError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      const redirectTo = searchParams.get('redirect') || '/restaurant';
      router.push(redirectTo);
    } catch {
      setFormError(error || 'Invalid email or password');
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
          <h1 className={styles.title}>Sign In</h1>
          <p className={styles.subtitle}>Welcome back</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
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
              Password
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
            {submitting ? '...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.switch}>
            Don&apos;t have an account? <Link href="/register">Sign Up</Link>
          </p>
        </div>

        <div className={styles.langPicker}>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as SupportedLanguage)}
            className={styles.langSelect}
          >
            {SUPPORTED_LANGUAGES.map((l: string) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
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
