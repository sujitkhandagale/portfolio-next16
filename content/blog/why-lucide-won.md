---
title: Why everyone uses Lucide, and why the reason they give is wrong
description: The bundle-size argument for Lucide is mostly false in Next.js, because Next already fixes the barrel-file problem for react-icons too. The actual reason it won is a 24px grid and a 2px stroke.
date: 2026-07-09
tags: [React, Icons, Bundle Size, Design Systems]
featured: false
---

Ask why a project uses [Lucide](https://lucide.dev) and you get the same answer: it's tree-shakable, the others aren't, you only ship the icons you use.

Half of that is true, and it's the half that stopped mattering in 2023.

## The barrel file, and the thing everyone gets wrong about it

Here's a real measurement from a project of mine that uses `react-icons`:

```
node_modules/react-icons          85M
node_modules/react-icons/si       10M
node_modules/react-icons/si/index.mjs   5.2M   ← one file
```

Thirty-one icon packs. The Simple Icons pack alone is a single 5.2 MB JavaScript module that re-exports every icon it contains. Import one icon from it and you have, on paper, asked a bundler to parse five megabytes to find one function.

That's a barrel file, and it's genuinely a problem. But notice what kind of problem it is. Ask any modern bundler to tree-shake that module and it will, correctly, throw away everything you didn't import. **The 5.2 MB does not reach the browser.** It never did, as long as you imported from the subpath and your bundler wasn't broken.

What the 5.2 MB *does* cost you is compile time. The bundler still has to read the file, build a module graph for a thousand exports, and prove each one is unused. In development, with no minifier and no tree-shaking, some of that graph gets evaluated on every request. That's why barrel files feel slow before they ever look large.

Next.js fixed this with `optimizePackageImports`, which rewrites `import { SiReact } from 'react-icons/si'` into a direct import of the one module that defines it, before the bundler ever opens the barrel. [Vercel's writeup](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js) puts it at 15–70% faster dev boot and 28% faster builds.

Now go read the [list of packages Next.js optimizes by default](https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports):

```
lucide-react
@tabler/icons-react
@heroicons/react/24/outline
@mui/icons-material
@ant-design/icons
react-icons/*        ← every pack
```

`lucide-react` is on that list. So is `react-icons/*`. If you are on Next.js, **the bundle-size argument for choosing Lucide over react-icons is already handled for both, by default, and has been for years.** Nobody updated the argument.

It still applies if you're on Vite or a bare Rollup config and importing from an unoptimized barrel. Check before you cite it.

## So why did Lucide win?

Because bundle size was never the interesting axis. Consistency was.

Lucide is a community fork of Feather Icons, ISC licensed, about 1,600 icons. Every one of them is drawn on a **24×24 grid with a 2px stroke and rounded caps**. That is the whole product.

An icon set is a typeface. You do not notice a good one, and you notice a bad one constantly — in the sidebar where one glyph sits two pixels lower than its neighbors, in the toolbar where the "settings" gear reads heavier than the "search" magnifier because they were drawn by different people on different grids and normalized by scaling.

`react-icons` is not an icon set. It's thirty-one icon sets in a trench coat, and the moment you pull `FaGithub` from Font Awesome and `SiTypescript` from Simple Icons into the same row, you're compositing two design systems with different optical weights, different corner radii, and different opinions about padding. You will spend an afternoon nudging one of them with a `transform: scale(0.92)` and never quite fix it.

That afternoon is what Lucide sells you out of. Not kilobytes.

## The stroke is a prop, and that's the actual API win

Because every Lucide icon is a stroked path rather than a filled one, the interesting properties stay adjustable at the call site:

```tsx
import { Search } from 'lucide-react';

<Search size={20} strokeWidth={1.5} className="text-muted" />
```

`size`, `color`, `strokeWidth`, `absoluteStrokeWidth`. Compare with a filled icon set, where "make this slightly lighter" means finding a different icon or reaching for `opacity`, which lightens it toward the background rather than thinning it.

`strokeWidth` is the one you'll reach for. The default 2px is drawn for 24px rendering. Render that icon at 16px in a dense table and it reads noticeably heavier than the text beside it, because the stroke didn't shrink with the box. Drop to `strokeWidth={1.5}` and the icon sits back into the row.

`absoluteStrokeWidth` is the opposite lever: it keeps the rendered stroke a fixed width regardless of the icon's size, so a 48px icon and a 16px icon have literally the same line weight. Useful when icons of different sizes share a surface. Wrong almost everywhere else — normally you *want* the stroke to scale, because that's what makes an icon look like it belongs at its size.

## What I'd do differently

I picked `react-icons` for a portfolio, on purpose, and I'd do it again. The tech-logo problem has exactly one good answer and Lucide is not it: Lucide draws *interface* icons, not brand marks, and there is no `<Lucide.TypeScript />` because there shouldn't be. Simple Icons has 3,000 brand logos and every one is the trademark holder's actual mark.

What I got wrong was mixing. I pulled brand marks from `react-icons/si` and, for a while, interface icons — arrows, chevrons, a mail glyph — from `react-icons/fa` too, because it was already installed. Font Awesome's arrows are filled, chunky, and drawn on a different grid. They sat next to my text at the wrong weight and I spent a real afternoon on a real `scale()` hack.

The rule I'd have wanted, stated plainly:

| Icon kind | Source | Why |
| --- | --- | --- |
| Interface — arrows, chevrons, menus | One stroked set (Lucide) | Consistency across every surface |
| Brand marks — GitHub, TypeScript | Simple Icons | It's the trademark holder's real mark |

Two packages, two jobs, no overlap. **One interface set. Never two.** The mistake isn't `react-icons` versus `lucide-react` — it's letting a second set of interface icons in the door because the package was already in `node_modules`.

## What to actually check before you switch

If you're on Next.js and using subpath imports, switching icon libraries will not measurably change your shipped bundle. It might change your dev-server boot time if you were importing from an unoptimized barrel, and you can find that out in ten minutes rather than guessing:

```bash
# Is your barrel actually reaching the bundler?
grep -rn "from 'react-icons'" src   # bad: root barrel, 31 packs
grep -rn "from 'react-icons/si'" src # fine: subpath, and Next optimizes it
```

The root-barrel import is the one that genuinely hurts, and it's a two-character fix.

---

Choose an icon library the way you choose a font: for how it looks in a row with its neighbors, at the size you'll actually render it. **The bytes were solved by your bundler while you were arguing about them.**

Sources: [Lucide](https://lucide.dev/guide/) · [`optimizePackageImports`](https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports) · [How we optimized package imports in Next.js](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
