import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ReadingProgress from '@/components/Blog/ReadingProgress';
import TableOfContents from '@/components/Blog/TableOfContents';
import CodeCopyButtons from '@/components/Blog/CodeCopyButtons';
import ShareLinks from '@/components/Blog/ShareLinks';
import {
  formatDate,
  getAdjacentPosts,
  getPost,
  getPostSlugs,
  getRelatedPosts,
  tagSlug,
} from '@/lib/blogs';
import { abs, site } from '@/lib/site';
import { profile } from '@/lib/data';
import styles from '@/components/Blog/Blog.module.scss';

const ARTICLE_ID = 'article-body';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPostSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post not found' };

  const url = abs(`/blog/${slug}`);
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: profile.name }],
    alternates: { canonical: url },
    // Drafts are only reachable in development, but be explicit.
    robots: post.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [profile.name],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts(slug);
  const related = getRelatedPosts(slug);
  const url = abs(`/blog/${slug}`);

  // Structured data: the article itself, plus the trail back to the index.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': url,
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        wordCount: post.wordCount,
        keywords: post.tags.join(', '),
        inLanguage: 'en',
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        author: {
          '@type': 'Person',
          name: profile.name,
          url: site.url,
alternateName: profile.role,
        },
        publisher: { '@type': 'Person', name: profile.name, url: site.url },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
          { '@type': 'ListItem', position: 2, name: 'Writing', item: abs('/blog') },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Navbar />
      <ReadingProgress targetId={ARTICLE_ID} />
      <CodeCopyButtons targetId={ARTICLE_ID} />

      <script
        type="application/ld+json"
        // The payload is our own frontmatter, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main" className={styles.postPage}>
        <div className={styles.inner}>
          <Link href="/blog" className={styles.back}>
            <span aria-hidden>←</span> All writing
          </Link>

          <header className={styles.postHead}>
            {post.tags.length > 0 && (
              <ul className={styles.postTags}>
                {post.tags.map(tag => (
                  <li key={tag}>
                    <Link href={`/blog/tag/${tagSlug(tag)}`}>{tag}</Link>
                  </li>
                ))}
              </ul>
            )}

            <h1 className={styles.postTitle}>{post.title}</h1>
            <p className={styles.postDescription}>{post.description}</p>

            <div className={styles.postMeta}>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden>·</span>
              <span>{post.readingTime}</span>
              {post.updated && (
                <>
                  <span aria-hidden>·</span>
                  <span>Updated {formatDate(post.updated)}</span>
                </>
              )}
            </div>
          </header>

          <div className={styles.postLayout}>
            <article
              id={ARTICLE_ID}
              className={styles.prose}
              // Rendered from our own markdown at build time.
              dangerouslySetInnerHTML={{ __html: post.html }}
            />

            <aside className={styles.postAside}>
              <TableOfContents toc={post.toc} />
            </aside>
          </div>

          <footer className={styles.postFoot}>
            <ShareLinks slug={post.slug} title={post.title} />

            {(prev || next) && (
              <nav className={styles.pager} aria-label="More posts">
                {prev ? (
                  <Link href={`/blog/${prev.slug}`} className={styles.pagerLink}>
                    <span className={styles.pagerLabel}>← Older</span>
                    <span className={styles.pagerTitle}>{prev.title}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {next && (
                  <Link
                    href={`/blog/${next.slug}`}
                    className={`${styles.pagerLink} ${styles.pagerNext}`}
                  >
                    <span className={styles.pagerLabel}>Newer →</span>
                    <span className={styles.pagerTitle}>{next.title}</span>
                  </Link>
                )}
              </nav>
            )}

            {related.length > 0 && (
              <section className={styles.related}>
                <h2 className={styles.relatedHeading}>Related</h2>
                <ul className={styles.relatedList}>
                  {related.map(r => (
                    <li key={r.slug}>
                      <Link href={`/blog/${r.slug}`}>
                        <span className={styles.relatedTitle}>{r.title}</span>
                        <span className={styles.relatedMeta}>
                          {formatDate(r.date)} · {r.readingTime}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </footer>
        </div>
      </main>
      <Footer />
    </>
  );
}
