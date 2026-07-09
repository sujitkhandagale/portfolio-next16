import { profile } from './data';

/**
 * Absolute origin for the deployed site. Metadata, RSS, sitemap and OG images
 * all need real URLs — relative ones are invalid in those contexts.
 *
 * Set NEXT_PUBLIC_SITE_URL in the environment (Vercel exposes the deploy URL
 * as VERCEL_URL, which we fall back to for previews).
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return 'http://localhost:3000';
}

export const site = {
  url: resolveSiteUrl(),
  name: `${profile.name} — ${profile.role}`,
  title: `${profile.name} — ${profile.role}`,
  description: profile.tagline,
  author: profile.name,
  locale: 'en_IN',
  /** Shown in the RSS channel and as the blog index heading. */
  blog: {
    title: `Writing — ${profile.name}`,
    description:
      'Notes on building products end to end: TypeScript, Next.js, job pipelines, and the details most people scroll past.',
  },
} as const;

/** Join a path onto the site origin. `abs('/blog')` → `https://…/blog`. */
export function abs(path = '/'): string {
  return new URL(path, site.url).toString();
}
