import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Reveal from '@/components/Reveal';
import PostCard from '@/components/Blog/PostCard';
import { getAllTags, getSortedPosts, tagSlug } from '@/lib/blogs';
import { abs, site } from '@/lib/site';
import styles from '@/components/Blog/Blog.module.scss';

export const metadata: Metadata = {
  title: 'Writing',
  description: site.blog.description,
  alternates: {
    canonical: abs('/blog'),
    types: { 'application/rss+xml': abs('/blog/rss.xml') },
  },
  openGraph: {
    title: site.blog.title,
    description: site.blog.description,
    url: abs('/blog'),
    type: 'website',
  },
};

export default function BlogIndex() {
  const posts = getSortedPosts();
  const tags = getAllTags();
  const [lead, ...rest] = posts;

  return (
    <>
      <Navbar />
      <main id="main" className={styles.page}>
        <div className={styles.inner}>
          <Reveal as="header" className={styles.head}>
            <p className={styles.eyebrow}>&gt; writing</p>
            <h1 className={styles.heading}>Notes from the build</h1>
            <p className={styles.lede}>{site.blog.description}</p>

            <a href="/blog/rss.xml" className={styles.rssLink}>
              RSS feed
            </a>
          </Reveal>

          {tags.length > 0 && (
            <Reveal as="nav" className={styles.tagBar} aria-label="Browse by tag">
              {tags.map(({ tag, count }) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tagSlug(tag)}`}
                  className={styles.tagChip}
                >
                  {tag}
                  <span className={styles.tagCount}>{count}</span>
                </Link>
              ))}
            </Reveal>
          )}

          {posts.length === 0 ? (
            <p className={styles.empty}>
              Nothing published yet. Drop a markdown file in{' '}
              <code>content/blog</code>.
            </p>
          ) : (
            <>
              <Reveal>
                <PostCard post={lead} featured />
              </Reveal>

              {rest.length > 0 && (
                <Reveal stagger as="div" className={styles.grid}>
                  {rest.map(post => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </Reveal>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
