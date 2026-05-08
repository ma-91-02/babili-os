'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/i18n';
import styles from './register.module.scss';

export default function RegisterPage() {
  const [lang, setLang] = useState<SupportedLanguage>('en');
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
      setFormError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await register({ name, email, password });
      router.push('/login');
    } catch {
      setFormError(error || 'Registration failed');
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
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Sign up</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Name
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              autoComplete="name"
              disabled={submitting}
            />
          </div>

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
            {submitting ? '...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.switch}>
            Already have an account? <Link href="/login">Sign In</Link>
          </p>
        </div>

        <div className={styles.langPicker}>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as SupportedLanguage)}
            className={styles.langSelect}
          >
            {SUPPORTED_LANGUAGES.map((l) => (
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
