'use client';

import { useEffect, useState } from 'react';
import styles from './Blog.module.scss';

/**
 * A hairline progress bar pinned under the navbar. Tracks how far the
 * article body — not the page — has been scrolled through.
 */
export default function ReadingProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const article = document.getElementById(targetId);
    if (!article) return;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const { top, height } = article.getBoundingClientRect();
        // How much of the article has passed the top of the viewport,
        // over the distance it takes to scroll the whole thing past.
        const scrollable = height - window.innerHeight;
        if (scrollable <= 0) {
          setProgress(top <= 0 ? 1 : 0);
          return;
        }
        setProgress(Math.min(1, Math.max(0, -top / scrollable)));
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
  }, [targetId]);

  return (
    <div
      className={styles.progress}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
