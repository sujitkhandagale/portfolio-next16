// Central place to register GSAP plugins once and re-export.
// Importing gsap/ScrollTrigger from here keeps registration consistent.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// registerPlugin is idempotent, safe to call from any client module.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// A defaults object you can spread into timelines for a consistent feel.
export const revealFrom = {
  y: 28,
  opacity: 0,
  filter: "blur(6px)",
};

export const revealTo = {
  y: 0,
  opacity: 1,
  filter: "blur(0px)",
  duration: 0.9,
  ease: "power3.out",
};

export { gsap, ScrollTrigger };
