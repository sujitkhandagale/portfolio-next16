"use client";

import { useRef } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import ProjectSlider from "@/components/ProjectSlider/ProjectSlider";
import { projects, type Project } from "@/lib/data";
import styles from "./Projects.module.scss";

// Cards preview at most this many screenshots; the detail page shows them all.
const CARD_SLIDES = 3;

function ProjectCard({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null);

  // Move a CSS-variable-driven spotlight to follow the pointer.
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  // The card is an <article> so the swipe slider and dots don't live inside
  // an anchor; the title carries the link to the case study instead.
  return (
    <article
      ref={ref as never}
      onMouseMove={onMove}
      className={`${styles.card} ${project.featured ? styles.featured : ""}`}
    >
      <span className={styles.spotlight} aria-hidden />

      <ProjectSlider
        slides={project.screenshots.slice(0, CARD_SLIDES)}
        index={project.index}
        title={project.title}
      />

      <div className={styles.body}>
        <div className={styles.cardHead}>
          <span className={styles.index}>{project.index}</span>
          <span className={styles.year}>{project.year}</span>
        </div>

        <h3 className={styles.title}>
          <Link href={`/projects/${project.id}`} className={styles.titleLink}>
            {project.title}
            <span className={styles.arrow} aria-hidden>
              →
            </span>
          </Link>
        </h3>

        <p className={styles.summary}>{project.summary}</p>

        <ul className={styles.tags}>
          {project.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <div className={styles.cardFoot}>
          <Link href={`/projects/${project.id}`} className={styles.caseLink}>
            Case study
          </Link>
          {project.href && (
            <a
              className={styles.liveLink}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              Live <span aria-hidden>↗</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className={`section ${styles.projects}`}>
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <p className={styles.eyebrow}>&gt; projects</p>
          <h2 className={styles.heading}>Selected work</h2>
        </Reveal>

        {featured.length > 0 && (
          <Reveal stagger as="div" className={styles.featuredGrid}>
            {featured.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </Reveal>
        )}

        {rest.length > 0 && (
          <Reveal stagger as="div" className={styles.grid}>
            {rest.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}
