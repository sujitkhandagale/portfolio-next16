import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import styles from '@/components/Blog/Blog.module.scss';

export default function PostNotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className={styles.notFound}>
        <p className={styles.eyebrow}>&gt; 404</p>
        <h1 className={styles.heading}>No such post.</h1>
        <p className={styles.lede}>
          That link points at something unpublished, renamed, or never written.
        </p>
        <Link href="/blog" className={styles.back}>
          <span aria-hidden>←</span> All writing
        </Link>
      </main>
      <Footer />
    </>
  );
}
