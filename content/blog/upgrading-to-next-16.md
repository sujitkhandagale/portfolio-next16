---
title: Upgrading to Next.js 16, and the four hours the codemod does not cover
description: Turbopack is the default, sync request APIs are gone, and next lint no longer exists. The upgrade is a two-minute command followed by a set of failures nobody warns you about.
date: 2026-07-09
tags: [Next.js, Turbopack, React, Migration]
featured: true
---

The upgrade command is honest about what it does:

```bash
npx @next/codemod@canary upgrade latest
```

It rewrites your `next.config`, moves `next lint` to the ESLint CLI, renames `middleware` to `proxy`, strips `unstable_` prefixes off the APIs that stabilized, and removes the `experimental_ppr` segment exports. It runs in about two minutes and it does all of that correctly.

Then `next build` fails, and you discover the codemod was never the hard part.

## Turbopack is not opt-in anymore

In 15, Turbopack was a flag you passed and forgot about. In 16, `next dev` and `next build` both use it by default, and you no longer write this:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack"
  }
}
```

You write `next dev` and `next build`. The flag still parses; it just does nothing.

The failure mode is the interesting bit. **If Next.js finds a `webpack` config, `next build` refuses to run.** Not a warning, not a silent fallback — a failed build. This is the right call: silently ignoring a config that used to shape your bundle would be worse. But it catches people who never wrote a webpack config in their life, because a plugin wrote one for them. Bundle analyzers do this. So do a handful of Sentry and MDX setups. If the error surprises you, grep your `next.config` for what your plugins wrap it in before you go looking for your own mistake.

Three ways out, in the order you should consider them:

| Option | Command | When |
| --- | --- | --- |
| Migrate the config | — | You control the webpack config and it does something small |
| Ignore it | `next build --turbopack` | The config came from a plugin you don't need |
| Keep webpack | `next build --webpack` | You have a real dependency on a loader Turbopack lacks |

The `turbopack` key also graduated out of `experimental`, so `experimental.turbopack` becomes a top-level `turbopack`. The codemod handles that one.

### Two things Turbopack does differently

**Sass tilde imports are dead.** Webpack let you write `@import '~bootstrap/dist/css/bootstrap.min.css'`. Turbopack resolves `node_modules` without the tilde and does not support the syntax:

```scss
/* Turbopack */
@import 'bootstrap/dist/css/bootstrap.min.css';
```

**`resolve.fallback` has a replacement, and you probably shouldn't use it.** If client code imports something that reaches for `fs`, webpack's `resolve.fallback` let you silence the error. Turbopack's equivalent is `turbopack.resolveAlias`:

```ts
const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      fs: { browser: './empty.ts' },
    },
  },
};
```

That is not a fix. It is a decision to ship a module to the browser that expects Node built-ins, and then to hand it an empty object when it asks. It worked in webpack for the same reason it works here: because nothing calls the code. Right up until something does.

## Async request APIs: the deprecation came due

Next.js 15 made `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` async, and left a synchronous compatibility path with a warning. In 16 that path is gone.

If you ignored those warnings for a year, this is your bill. The codemod covers most of it, and `npx next typegen` generates the type helpers that make the rest mechanical:

```tsx
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  return <h1>{slug}</h1>;
}
```

Two corners the migration guides bury, both of which fail at build time rather than in the editor:

- **Metadata images.** `params` and `id` in `opengraph-image`, `twitter-image`, `icon`, and `apple-icon` are now Promises. `generateImageMetadata` still receives sync `params`. So the two functions in the same file take the same-named argument with different types.
- **Sitemaps.** The `id` returned from `generateSitemaps` arrives at `sitemap()` as `Promise<string>` — note *string*, even though you returned a number. `const start = id * 50000` becomes `Number(await id) * 50000`.

## `revalidateTag` grew a second argument

This is the change most likely to be wrong in your codebase without failing anything.

```ts
revalidateTag('posts');          // deprecated, TS error
revalidateTag('posts', 'max');   // stale-while-revalidate
```

The second argument is a `cacheLife` profile, and it decides whether users see stale content while revalidation happens in the background. `'max'` is the recommendation for long-lived content.

But `revalidateTag` was never what most people wanted. If a user submits a form and expects to see their own change on the next render, stale-while-revalidate is precisely the wrong semantics — they wrote, and then they read someone else's old copy. That case now has its own API:

```ts
'use server';
import { updateTag } from 'next/cache';

export async function updateUserProfile(userId: string, profile: Profile) {
  await db.users.update(userId, profile);
  updateTag(`user-${userId}`); // read-your-writes, same request
}
```

Reach for `updateTag` when a human is waiting to see the thing they just did. Reach for `revalidateTag` when the content is a blog post or a product catalogue and a few seconds of staleness costs nobody anything. There is also `refresh()`, which refreshes uncached data and touches no cache at all.

## The quiet removals

These have no codemod and no runtime error. They change behavior and let you find out in production.

**`images.qualities` defaults to `[75]`.** Previously every quality from 1 to 100 was permitted. Now a `quality={90}` prop is *coerced to the nearest allowed value*, which is 75. Your images get quieter, not broken. Nothing logs.

**`images.minimumCacheTTL` went from 60 seconds to 4 hours.** Good default — the old one hammered upstream images that shipped no `cache-control` header. But if you were relying on 60-second image revalidation, you are now on a four-hour cache and the CDN is doing exactly what you asked.

**`images.maximumRedirects` went from unlimited to 3.** **`imageSizes` lost `16`.** **`images.domains` is deprecated** in favor of `remotePatterns`.

**Parallel routes now require `default.js` in every slot.** This one at least fails the build. `notFound()` or `return null` restores the old behavior.

**`scroll-behavior: smooth` is no longer overridden during navigation.** Next.js used to force `auto` mid-navigation so route changes felt instant. It doesn't anymore. If your route transitions started smooth-scrolling to the top like a drunk elevator, add `data-scroll-behavior="smooth"` to your `<html>` element to get the old override back.

**`serverRuntimeConfig` and `publicRuntimeConfig` are gone.** Environment variables, `NEXT_PUBLIC_` prefix for client, and `await connection()` before reading `process.env` if you need the value at request time rather than baked in at build.

**`next lint` is removed, and `next build` no longer lints.** Run ESLint or Biome yourself. If your CI relied on `next build` catching lint errors, your CI now catches nothing.

## Version floors

Node 20.9+ — 18 is out. TypeScript 5.1+. Chrome/Edge/Firefox 111+, Safari 16.4+.

Check the Node version on your deploy target *before* the upgrade, not after. Nothing in the local upgrade path tells you the build image is on 18.

## What I'd do differently

I ran the codemod first and read the upgrade guide when the build broke. Backwards. The codemod is safe and boring; the guide contains the four or five behavioral changes that no tool can detect, and reading it takes fifteen minutes. Do that, then run the codemod, then read the diff the codemod produced before you commit it.

The other thing: I upgraded `next`, `react`, and `react-dom` together and got a `react-dom` type error that I spent an hour attributing to Next.js 16. Bump `@types/react` and `@types/react-dom` in the same commit. The docs mention this in a single sentence and it is the sentence I skimmed.

---

The 16 upgrade is not the 13 upgrade. Nothing here is a rewrite. But the removals are not typos you can catch by reading a stack trace — **the ones that will hurt are the ones that changed a default and told nobody.** Grep for `revalidateTag`, `quality=`, and `scroll-behavior` before you ship.

Sources: [Upgrading: Version 16](https://nextjs.org/docs/app/guides/upgrading/version-16) · [Next.js 16 release notes](https://nextjs.org/blog/next-16)
