"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { profile } from "@/lib/data";
import styles from "./Hero.module.scss";

const logLines = [
  "> booting portfolio…",
  "> loading projects [4] ✓",
  "> resolving identity ✓",
  "> ready.",
];

export default function Hero() {
  const scope = useRef<HTMLElement>(null);
  const [logIndex, setLogIndex] = useState(0);

  // Cycle the little "build log" status line.
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setLogIndex(logLines.length - 1);
      return;
    }
    if (logIndex >= logLines.length - 1) return;
    const t = setTimeout(() => setLogIndex((i) => i + 1), 650);
    return () => clearTimeout(t);
  }, [logIndex]);

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
          `.${styles.console}`,
          { opacity: 0, y: 14, duration: 0.7 },
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

        <div className={styles.console} aria-hidden>
          <div className={styles.consoleBar}>
            <span />
            <span />
            <span />
            <em>~/portfolio</em>
          </div>
          <code className={styles.consoleBody}>
            {logLines.slice(0, logIndex + 1).map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </code>
        </div>
      </div>

      <a href="#about" className={styles.scrollCue} aria-label="Scroll down">
        <span>scroll</span>
        <span className={styles.cueLine} aria-hidden />
      </a>
    </section>
  );
}
