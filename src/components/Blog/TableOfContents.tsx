'use client';

import { useEffect, useState } from 'react';
import type { TocEntry } from '@/lib/blogs';
import styles from './Blog.module.scss';

/**
 * Sticky table of contents with scrollspy. The active heading is the
 * last one to have crossed the top quarter of the viewport, which is
 * what "where am I" means to a reader — an IntersectionObserver alone
 * would go blank while scrolling through a long section.
 */
export default function TableOfContents({ toc }: { toc: TocEntry[] }) {
  const [active, setActive] = useState<string>(toc[0]?.id ?? '');

  useEffect(() => {
    if (toc.length === 0) return;

    const headings = toc
      .map(t => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const line = window.innerHeight * 0.25;
        let current = headings[0];
        for (const h of headings) {
          if (h.getBoundingClientRect().top <= line) current = h;
          else break;
        }
        // At the very bottom, the last heading wins even if it never
        // reached the line — otherwise the final section is unreachable.
        const atBottom =
          window.innerHeight + window.scrollY >=
          document.body.scrollHeight - 2;
        setActive(atBottom ? headings[headings.length - 1].id : current.id);
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      cancelAnimationFrame(raf);
    };
  }, [toc]);

  if (toc.length < 2) return null;

  return (
    <nav className={styles.toc} aria-label="Table of contents">
      <p className={styles.tocHeading}>On this page</p>
      <ul className={styles.tocList}>
        {toc.map(entry => (
          <li
            key={entry.id}
            className={entry.depth === 3 ? styles.tocNested : undefined}
          >
            <a
              href={`#${entry.id}`}
              className={`${styles.tocLink} ${
                active === entry.id ? styles.tocActive : ''
              }`}
              aria-current={active === entry.id ? 'location' : undefined}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
