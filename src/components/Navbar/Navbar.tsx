"use client";

import { useEffect, useState } from "react";
import { profile } from "@/lib/data";
import styles from "./Navbar.module.scss";

// Root-relative so they resolve from a project detail page too, not just "/".
const links = [
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "Projects" },
  { href: "/#skills", label: "Skills" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <a href="/" className={styles.brand} aria-label="Home">
          <span className={styles.dot} aria-hidden />
          {profile.name.split(" ")[0]}
          <span className={styles.brandMono}>.dev</span>
        </a>

        <nav className={styles.links} aria-label="Primary">
          {links.map((l) => (
            <a key={l.href} href={l.href} className={styles.link}>
              {l.label}
            </a>
          ))}
        </nav>

        <a href="/#contact" className={styles.cta}>
          Let&rsquo;s talk
        </a>
      </div>
    </header>
  );
}
