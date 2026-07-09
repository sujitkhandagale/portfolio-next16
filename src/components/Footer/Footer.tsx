import { profile } from "@/lib/data";
import styles from "./Footer.module.scss";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.mono}>
          © {year} {profile.name}
        </span>
        <span className={styles.mono}>
          Built with Next.js + GSAP · <a href="#top">back to top ↑</a>
        </span>
      </div>
    </footer>
  );
}
