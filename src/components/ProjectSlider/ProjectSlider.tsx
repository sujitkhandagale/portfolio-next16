"use client";

import { useEffect, useRef, useState } from "react";
import type { Screenshot } from "@/lib/data";
import styles from "./ProjectSlider.module.scss";

type Props = {
  slides: Screenshot[];
  /** Project marker, e.g. "01" — seeds the placeholder hue. */
  index: string;
  title: string;
  /** Render the caption under the frame and enable arrow-key navigation. */
  detailed?: boolean;
  className?: string;
};

/**
 * 16:9 image slider. Native scroll-snap gives real touch swipe on mobile;
 * a pointer-drag handler adds click-drag on desktop (mouse only, so it never
 * fights native touch scrolling). Dots jump to a slide and track the active one.
 * Slides without a `src` render as generated gradient placeholders.
 */
export default function ProjectSlider({
  slides,
  index,
  title,
  detailed = false,
  className,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const count = slides.length;

  // Base hue from the project index so each card's placeholders differ.
  const baseHue = (parseInt(index, 10) || 1) * 47;

  // Keep the active dot in sync with the scroll position.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setActive(Math.round(track.scrollLeft / track.clientWidth));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(count - 1, i));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
  };

  // Click-drag for mouse pointers only. Touch keeps native scroll-snap.
  const drag = useRef({ x: 0, left: 0, active: false });
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const track = trackRef.current;
    if (!track) return;
    drag.current = { x: e.clientX, left: track.scrollLeft, active: true };
    track.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
  };
  const endDrag = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const track = trackRef.current;
    if (!track) return;
    track.releasePointerCapture(e.pointerId);
    goTo(Math.round(track.scrollLeft / track.clientWidth));
  };

  // The gallery is a focusable region on the detail page, so arrow keys work.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!detailed || count < 2) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(active - 1);
    }
  };

  const caption = slides[active]?.caption;

  return (
    <figure
      className={`${styles.slider} ${detailed ? styles.detailed : ""} ${
        className ?? ""
      }`}
    >
      <div className={styles.media}>
        <div
          ref={trackRef}
          className={styles.track}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
          tabIndex={detailed ? 0 : undefined}
          role="group"
          aria-roledescription="carousel"
          aria-label={`${title} screenshots`}
        >
          {slides.map((slide, i) => {
            const hue = (baseHue + i * 24) % 360;
            const style = slide.src
              ? { backgroundImage: `url(${slide.src})` }
              : {
                  backgroundImage: `linear-gradient(135deg, hsl(${hue} 45% 22%), hsl(${
                    (hue + 40) % 360
                  } 55% 14%))`,
                };
            return (
              <div
                key={i}
                className={styles.slide}
                style={style}
                aria-label={slide.alt ?? slide.caption}
                role="group"
                aria-roledescription="slide"
              >
                {!slide.src && detailed && (
                  <span className={styles.placeholder} aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              className={`${styles.arrowBtn} ${styles.arrowPrev}`}
              aria-label="Previous slide"
              disabled={active === 0}
              onClick={() => goTo(active - 1)}
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.arrowBtn} ${styles.arrowNext}`}
              aria-label="Next slide"
              disabled={active === count - 1}
              onClick={() => goTo(active + 1)}
            >
              ›
            </button>
          </>
        )}

        {count > 1 && (
          <div className={styles.dots}>
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.dot} ${
                  i === active ? styles.dotActive : ""
                }`}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === active}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        )}
      </div>

      {detailed && caption && (
        <figcaption className={styles.caption}>
          <span className={styles.counter}>
            {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
