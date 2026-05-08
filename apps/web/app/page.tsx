import Link from 'next/link';
import styles from './page.module.scss';

export default function HomePage() {
  return (
    <div className={styles.landing}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon} />
          <span className={styles.logoText}>Babili</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/admin" className="btn btn-ghost">
            Admin
          </Link>
          <Link href="/restaurant" className="btn btn-ghost">
            Restaurant
          </Link>
          <Link href="/staff" className="btn btn-ghost">
            Staff
          </Link>
          <Link href="/customer" className="btn btn-primary">
            Customer
          </Link>
        </nav>
      </header>

      <main className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>Smart Restaurant OS</div>
          <h1 className={styles.title}>
            From table to kitchen —<span className={styles.highlight}> in every language</span>
          </h1>
          <p className={styles.subtitle}>
            Babili is a multilingual restaurant operating system that connects tables, kitchen, and
            management in 25 languages.
          </p>
          <div className={styles.cta}>
            <Link href="/customer" className="btn btn-primary">
              Order Now
            </Link>
            <Link href="/restaurant" className="btn btn-secondary">
              Manage Restaurant
            </Link>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.pattern} />
          <div className={styles.geometricLine} />
          <div className={styles.geometricLine} />
          <div className={styles.geometricLine} />
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Babili — Smart multilingual restaurant operations from table to kitchen.</p>
      </footer>
    </div>
  );
}
