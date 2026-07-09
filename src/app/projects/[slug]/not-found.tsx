import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import styles from "./not-found.module.scss";

export default function ProjectNotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className={styles.wrap}>
        <p className={styles.eyebrow}>&gt; 404</p>
        <h1 className={styles.title}>No such project.</h1>
        <p className={styles.body}>
          That link points at something I haven&rsquo;t built — or haven&rsquo;t
          written up yet.
        </p>
        <Link href="/#projects" className={styles.link}>
          <span aria-hidden>←</span> Back to all work
        </Link>
      </main>
      <Footer />
    </>
  );
}
