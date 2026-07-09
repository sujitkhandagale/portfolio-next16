import Reveal from "@/components/Reveal";
import { profile } from "@/lib/data";
import styles from "./Contact.module.scss";

export default function Contact() {
  return (
    <section id="contact" className={`section ${styles.contact}`}>
      <div className={styles.inner}>
        <Reveal className={styles.card}>
          <p className={styles.eyebrow}>&gt; contact</p>
          <h2 className={styles.heading}>
            Have something worth building?
          </h2>
          <p className={styles.sub}>
            I&rsquo;m open to interesting work and collaborations. The fastest
            way to reach me is email.
          </p>

          <a href={`mailto:${profile.email}`} className={styles.email}>
            {profile.email}
            <span aria-hidden>↗</span>
          </a>

          <div className={styles.socials}>
            <a
              href={profile.socials.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              href={profile.socials.x}
              target="_blank"
              rel="noopener noreferrer"
            >
              X
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
