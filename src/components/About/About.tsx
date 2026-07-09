import Reveal from "@/components/Reveal";
import { about } from "@/lib/data";
import styles from "./About.module.scss";

export default function About() {
  return (
    <section id="about" className={`section ${styles.about}`}>
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <p className={styles.eyebrow}>// about</p>
          <h2 className={styles.heading}>
            Engineer by trade,
            <br />
            perfectionist by habit.
          </h2>
        </Reveal>

        <div className={styles.body}>
          <Reveal stagger className={styles.copy} as="div">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>

          <Reveal stagger className={styles.stats} as="dl">
            {about.stats.map((s) => (
              <div key={s.label} className={styles.stat}>
                <dd>{s.value}</dd>
                <dt>{s.label}</dt>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
