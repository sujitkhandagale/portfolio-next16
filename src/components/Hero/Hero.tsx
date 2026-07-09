"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { profile } from "@/lib/data";
import styles from "./Hero.module.scss";

export default function Hero() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduce) return;

      const tl = gsap.timeline({
        defaults: { ease: "power4.out", duration: 1 },
      });

      tl.from(`.${styles.eyebrow}`, { opacity: 0, y: 12, duration: 0.6 })
        .from(
          `.${styles.line} span`,
          { yPercent: 118, duration: 1.05, stagger: 0.12 },
          "-=0.2"
        )
        .from(
          `.${styles.tagline}`,
          { opacity: 0, y: 20, filter: "blur(6px)" },
          "-=0.55"
        )
        .from(
          `.${styles.metaItem}`,
          { opacity: 0, y: 14, stagger: 0.1, duration: 0.7 },
          "-=0.5"
        )
        .from(
          `.${styles.scrollCue}`,
          { opacity: 0, duration: 0.8 },
          "-=0.2"
        );
    },
    { scope }
  );

  const nameLines = profile.name.split(" ");

  return (
    <section id="top" ref={scope} className={styles.hero}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.blink} aria-hidden>
            ●
          </span>
          {profile.role} · {profile.location}
        </p>

        <h1 className={styles.name}>
          {nameLines.map((word, i) => (
            <span key={i} className={styles.line}>
              <span>{word}</span>
            </span>
          ))}
        </h1>

        <p className={styles.tagline}>{profile.tagline}</p>

        <div className={styles.meta}>
          <a href="#projects" className={`${styles.metaItem} ${styles.primary}`}>
            View work
          </a>
          <a
            href={profile.socials.github}
            className={styles.metaItem}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
          <a
            href={profile.socials.linkedin}
            className={styles.metaItem}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
        </div>
      </div>

      <a href="#about" className={styles.scrollCue} aria-label="Scroll down">
        <span>scroll</span>
        <span className={styles.cueLine} aria-hidden />
      </a>
    </section>
  );
}
