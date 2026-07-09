import Link from "next/link";
import Reveal from "@/components/Reveal";
import ProjectSlider from "@/components/ProjectSlider/ProjectSlider";
import { getNextProject, type Project } from "@/lib/data";
import styles from "./ProjectDetail.module.scss";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function ProjectDetail({ project }: { project: Project }) {
  const next = getNextProject(project.id);
  const meta = [
    { label: "Role", value: project.role },
    { label: "Timeline", value: project.timeline },
    { label: "Status", value: project.status },
  ];

  return (
    <article className={styles.page}>
      <div className={styles.inner}>
        <Link href="/#projects" className={styles.back}>
          <span aria-hidden>←</span> All work
        </Link>

        {/* --- header ------------------------------------------------ */}
        <Reveal as="header" className={styles.head}>
          <p className={styles.eyebrow}>
            <span className={styles.index}>{project.index}</span>
            <span aria-hidden>·</span>
            <span>{project.year}</span>
          </p>

          <h1 className={styles.title}>{project.title}</h1>
          <p className={styles.subtitle}>{project.subtitle}</p>

          <ul className={styles.tags}>
            {project.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          {(project.href || project.repo) && (
            <div className={styles.actions}>
              {project.href && (
                <a className={styles.primaryBtn} href={project.href} {...external}>
                  Visit live site <span aria-hidden>↗</span>
                </a>
              )}
              {project.repo && (
                <a className={styles.ghostBtn} href={project.repo} {...external}>
                  Source <span aria-hidden>↗</span>
                </a>
              )}
            </div>
          )}
        </Reveal>

        {/* --- gallery ----------------------------------------------- */}
        <Reveal as="section" className={styles.gallery}>
          <h2 className="sr-only">Screenshots</h2>
          <ProjectSlider
            slides={project.screenshots}
            index={project.index}
            title={project.title}
            detailed
          />
        </Reveal>

        {/* --- overview + stack -------------------------------------- */}
        <div className={styles.columns}>
          <Reveal as="section" className={styles.overview}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionMark}>&gt;</span> Overview
            </h2>
            {project.overview.map((p) => (
              <p key={p.slice(0, 24)} className={styles.paragraph}>
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal as="aside" className={styles.sidebar}>
            <div className={styles.sidebarInner}>
              <section className={styles.panel}>
                <h2 className={styles.panelHeading}>Stack</h2>
                {project.stack.map((g) => (
                  <div key={g.group} className={styles.stackGroup}>
                    <p className={styles.stackLabel}>{g.group}</p>
                    <ul className={styles.stackItems}>
                      {g.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>

              <section className={styles.panel}>
                <h2 className={styles.panelHeading}>Details</h2>
                <dl className={styles.meta}>
                  {meta.map((m) => (
                    <div key={m.label} className={styles.metaRow}>
                      <dt>{m.label}</dt>
                      <dd>{m.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </Reveal>
        </div>

        {/* --- highlights -------------------------------------------- */}
        <section className={styles.highlights}>
          <Reveal>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionMark}>&gt;</span> Highlights
            </h2>
          </Reveal>

          <Reveal stagger as="div" className={styles.highlightGrid}>
            {project.highlights.map((h, i) => (
              <div key={h.title} className={styles.highlight}>
                <span className={styles.highlightIndex}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.highlightTitle}>{h.title}</h3>
                <p className={styles.highlightBody}>{h.body}</p>
              </div>
            ))}
          </Reveal>
        </section>

        {/* --- next project ------------------------------------------ */}
        <Reveal as="nav" className={styles.next} aria-label="Next project">
          <Link href={`/projects/${next.id}`} className={styles.nextLink}>
            <span className={styles.nextLabel}>Next project</span>
            <span className={styles.nextTitle}>
              {next.title}
              <span className={styles.nextArrow} aria-hidden>
                →
              </span>
            </span>
          </Link>
        </Reveal>
      </div>
    </article>
  );
}
