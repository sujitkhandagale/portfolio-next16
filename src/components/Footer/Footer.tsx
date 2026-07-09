import Link from 'next/link';
import { profile } from '@/lib/data';
import styles from './Footer.module.scss';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.mono}>
          © {year} {profile?.name}
        </span>

        <nav className={`${styles.mono} ${styles.links}`} aria-label="Footer">
          <Link href="/blog">writing</Link>
          {/* Plain anchor: the feed is a route handler, not a page. */}
          <a href="/blog/rss.xml">rss</a>
        </nav>

        <span className={styles.mono}>
          <a href="#top">back to top ↑</a>
        </span>
      </div>
    </footer>
  );
}
