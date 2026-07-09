"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type RevealProps = {
  children: React.ReactNode;
  /** Stagger direct children instead of animating the wrapper as one block. */
  stagger?: boolean;
  /** Delay before the reveal starts, in seconds. */
  delay?: number;
  /** Vertical travel distance in px. */
  y?: number;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  id?: string;
  "aria-label"?: string;
};

/**
 * Fades + lifts content into view when it scrolls near the viewport.
 * Set `stagger` to cascade the immediate children (great for card grids
 * and lists). Honors prefers-reduced-motion automatically via gsap.matchMedia.
 */
export default function Reveal({
  children,
  stagger = false,
  delay = 0,
  y = 30,
  as = "div",
  className,
  id,
  "aria-label": ariaLabel,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          reduced: "(prefers-reduced-motion: reduce)",
          animated: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const { reduced } = ctx.conditions as { reduced: boolean };

          const targets = stagger ? Array.from(el.children) : el;

          if (reduced) {
            gsap.set(targets, { opacity: 1, y: 0, clearProps: "filter" });
            return;
          }

          gsap.from(targets, {
            y,
            opacity: 0,
            filter: "blur(6px)",
            duration: 0.9,
            delay,
            ease: "power3.out",
            stagger: stagger ? 0.09 : 0,
            scrollTrigger: {
              trigger: el,
              start: "top 82%",
              once: true,
            },
          });
        }
      );

      return () => {
        mm.revert();
        ScrollTrigger.refresh();
      };
    },
    { scope: ref, dependencies: [stagger, delay, y] }
  );

  const Tag = as as React.ElementType;
  return (
    <Tag ref={ref} className={className} id={id} aria-label={ariaLabel}>
      {children}
    </Tag>
  );
}
