import type { IconType } from "react-icons";
import {
  SiTypescript,
  SiJavascript,
  SiLua,
  SiMysql,
  SiNextdotjs,
  SiReact,
  SiGreensock,
  SiSass,
  SiNodedotjs,
  SiDiscord,
  SiMongoose,
  SiRedis,
  SiGit,
  SiDocker,
  SiVercel,
  SiFigma,
} from "react-icons/si";
import Reveal from "@/components/Reveal";
import { skills } from "@/lib/data";
import styles from "./Skills.module.scss";

// Brand icon + color per tool. Color drives the hover glow via --brand.
const registry: Record<string, { Icon: IconType; color: string }> = {
  TypeScript: { Icon: SiTypescript, color: "#3178c6" },
  JavaScript: { Icon: SiJavascript, color: "#f7df1e" },
  Lua: { Icon: SiLua, color: "#7986e7" },
  SQL: { Icon: SiMysql, color: "#4479a1" },
  "Next.js": { Icon: SiNextdotjs, color: "#e9ebf2" },
  React: { Icon: SiReact, color: "#61dafb" },
  GSAP: { Icon: SiGreensock, color: "#0ae448" },
  "SCSS Modules": { Icon: SiSass, color: "#cc6699" },
  "Node.js": { Icon: SiNodedotjs, color: "#5fa04e" },
  "Discord.js": { Icon: SiDiscord, color: "#5865f2" },
  Mongoose: { Icon: SiMongoose, color: "#b4463b" },
  BullMQ: { Icon: SiRedis, color: "#ff4438" },
  Git: { Icon: SiGit, color: "#f05033" },
  Docker: { Icon: SiDocker, color: "#2496ed" },
  Vercel: { Icon: SiVercel, color: "#e9ebf2" },
  Figma: { Icon: SiFigma, color: "#f24e1e" },
};

export default function Skills() {
  return (
    <section id="skills" className={`section ${styles.skills}`}>
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <p className={styles.eyebrow}>// stack</p>
          <h2 className={styles.heading}>Tools I reach for</h2>
        </Reveal>

        <Reveal stagger as="div" className={styles.grid}>
          {skills.map((group) => (
            <div key={group.group} className={styles.group}>
              <h3 className={styles.groupName}>{group.group}</h3>
              <ul className={styles.items}>
                {group.items.map((item) => {
                  const entry = registry[item];
                  const Icon = entry?.Icon;
                  return (
                    <li
                      key={item}
                      className={styles.item}
                      style={
                        { "--brand": entry?.color ?? "var(--primary)" } as React.CSSProperties
                      }
                    >
                      <span className={styles.icon} aria-hidden>
                        {Icon ? <Icon /> : <span className={styles.bullet} />}
                      </span>
                      <span className={styles.label}>{item}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
