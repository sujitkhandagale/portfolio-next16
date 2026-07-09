import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Reveal from '@/components/Reveal';
import PostCard from '@/components/Blog/PostCard';
import { getAllTags, getPostsByTag, tagFromSlug, tagSlug } from '@/lib/blogs';
import { abs } from '@/lib/site';
import styles from '@/components/Blog/Blog.module.scss';

type Props = { params: Promise<{ tag: string }> };

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag: tagSlug(tag) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag: slug } = await params;
  const tag = tagFromSlug(slug);
  if (!tag) return { title: 'Tag not found' };

  const title = `Posts tagged ${tag}`;
  const description = `Everything written about ${tag}.`;
  return {
    title,
    description,
    alternates: { canonical: abs(`/blog/tag/${slug}`) },
    openGraph: { title, description, url: abs(`/blog/tag/${slug}`), type: 'website' },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag: slug } = await params;
  const tag = tagFromSlug(slug);
  if (!tag) notFound();

  const posts = getPostsByTag(tag);

  return (
    <>
      <Navbar />
      <main id="main" className={styles.page}>
        <div className={styles.inner}>
          <Link href="/blog" className={styles.back}>
            <span aria-hidden>←</span> All writing
          </Link>

          <Reveal as="header" className={styles.head}>
            <p className={styles.eyebrow}>&gt; tag</p>
            <h1 className={styles.heading}>{tag}</h1>
            <p className={styles.lede}>
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}.
            </p>
          </Reveal>

          <Reveal stagger as="div" className={styles.grid}>
            {posts.map(post => (
              <PostCard key={post.slug} post={post} />
            ))}
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
