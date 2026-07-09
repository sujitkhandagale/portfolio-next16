import { abs } from '@/lib/site';
import styles from './Blog.module.scss';

const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

/** Plain links, not SDK buttons — no third-party script, no tracking. */
export default function ShareLinks({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const url = abs(`/blog/${slug}`);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    { label: 'X', href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: 'Hacker News',
      href: `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${encodedTitle}`,
    },
  ];

  return (
    <div className={styles.share}>
      <span className={styles.shareLabel}>Share</span>
      {targets.map(t => (
        <a key={t.label} href={t.href} className={styles.shareLink} {...external}>
          {t.label}
        </a>
      ))}
    </div>
  );
}
