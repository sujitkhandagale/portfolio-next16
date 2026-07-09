import Link from 'next/link';
import { formatDate, tagSlug, type PostMeta } from '@/lib/blogs';
import styles from './Blog.module.scss';

export default function PostCard({
  post,
  featured = false,
}: {
  post: PostMeta;
  featured?: boolean;
}) {
  return (
    <article className={`${styles.card} ${featured ? styles.cardFeatured : ''}`}>
      <div className={styles.cardMeta}>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span aria-hidden>·</span>
        <span>{post.readingTime}</span>
        {post.draft && <span className={styles.draftPill}>Draft</span>}
      </div>

      <h2 className={styles.cardTitle}>
        <Link href={`/blog/${post.slug}`} className={styles.cardLink}>
          {post.title}
          <span className={styles.cardArrow} aria-hidden>
            →
          </span>
        </Link>
      </h2>

      <p className={styles.cardDescription}>{post.description}</p>

      {post.tags.length > 0 && (
        <ul className={styles.cardTags}>
          {post.tags.map(tag => (
            <li key={tag}>
              {/* Nested inside the card, but a distinct destination. */}
              <Link href={`/blog/tag/${tagSlug(tag)}`}>{tag}</Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
