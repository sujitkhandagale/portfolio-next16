# Portfolio — Next.js + GSAP

A feature-rich single-page developer portfolio built on the **Next.js App Router**
with **GSAP** (page-load timeline, scroll reveals, cursor spotlight) and **Lenis**
smooth scrolling. Dark theme, SCSS modules, fully typed.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- GSAP 3 + `@gsap/react` (`useGSAP`) + ScrollTrigger
- Lenis (smooth scroll, synced to the GSAP ticker)
- Sass (SCSS modules) with a token system
- `next/font` self-hosting Space Grotesk / Inter / JetBrains Mono

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Make it yours

Almost everything is data-driven — you rarely need to touch the components.

| What | Where |
| --- | --- |
| Name, role, tagline, email, socials | `src/lib/data.ts` → `profile` |
| About paragraphs + stats | `src/lib/data.ts` → `about` |
| Projects (add/remove/reorder) | `src/lib/data.ts` → `projects` |
| Skill groups | `src/lib/data.ts` → `skills` |
| Colors, fonts, spacing, radii | `src/styles/_tokens.scss` |

- Mark a project `featured: true` to give it a large two-column card.
- The hero's big name splits on spaces — the second word gets an outline treatment.

## Animation notes

- **Load-in:** `Hero.tsx` runs a `useGSAP` timeline (eyebrow → name lines clip up
  → tagline → meta → console).
- **Scroll reveals:** wrap anything in `<Reveal>` (`src/components/Reveal.tsx`).
  Add `stagger` to cascade direct children (used by the card grids).
- **Smooth scroll:** `SmoothScroll.tsx` runs Lenis and feeds it into
  `gsap.ticker` so ScrollTrigger stays in sync. Anchor links route through Lenis.
- **Reduced motion:** every animation checks `prefers-reduced-motion` and shows
  content statically instead. Lenis is skipped entirely.

## Structure

```
src/
├── app/
│   ├── layout.tsx        # fonts, metadata, <SmoothScroll>
│   ├── page.tsx          # section composition
│   └── globals.scss      # CSS vars, resets, section rhythm
├── components/
│   ├── SmoothScroll.tsx  # Lenis ↔ GSAP ticker
│   ├── Reveal.tsx        # reusable scroll-reveal
│   ├── Navbar/  Hero/  About/  Projects/  Skills/  Contact/  Footer/
├── lib/
│   ├── gsap.ts           # plugin registration
│   └── data.ts           # all site content
└── styles/
    ├── _tokens.scss      # design tokens
    └── _mixins.scss      # container, breakpoints, eyebrow, focus
```

## Upgrading to GSAP ScrollSmoother

This uses Lenis (free) for smooth scroll. If you have a GreenSock Club license,
you can swap in GSAP's `ScrollSmoother` plugin instead and drop the `lenis`
dependency — the rest of the ScrollTrigger setup stays the same.
# portfolio-next16
