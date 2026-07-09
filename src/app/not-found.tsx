import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import styles from '@/components/Blog/Blog.module.scss';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className={styles.notFound}>
        <p className={styles.eyebrow}>&gt; 404</p>
        <h1 className={styles.heading}>Nothing here.</h1>
        <p className={styles.lede}>
          The page you asked for doesn&rsquo;t exist — or it moved and left no
          forwarding address.
        </p>
        <Link href="/" className={styles.back}>
          <span aria-hidden>←</span> Back home
        </Link>
      </main>
      <Footer />
    </>
  );
}
