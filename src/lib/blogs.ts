import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import GithubSlugger from 'github-slugger';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings, {
  type Options as AutolinkOptions,
} from 'rehype-autolink-headings';
import rehypePrettyCode, {
  type Options as PrettyCodeOptions,
} from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';

// ------------------------------------------------------------------
// Markdown blog. Posts are .md files in content/blog with YAML
// frontmatter. Everything here runs on the server at build time.
// ------------------------------------------------------------------

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

/** Frontmatter as authored. Only `title`, `description` and `date` are required. */
export type PostFrontmatter = {
  title: string;
  description: string;
  /** ISO date, e.g. 2026-07-09. */
  date: string;
  /** Set when a post is materially revised; surfaced as `dateModified`. */
  updated?: string;
  tags?: string[];
  /** Pins the post to the top of the index. */
  featured?: boolean;
  /** Excluded from the index, RSS, sitemap and static params. */
  draft?: boolean;
};

export type TocEntry = {
  id: string;
  text: string;
  depth: 2 | 3;
};

export type PostMeta = PostFrontmatter & {
  slug: string;
  /** e.g. "6 min read" */
  readingTime: string;
  wordCount: number;
  tags: string[];
};

export type Post = PostMeta & {
  /** Rendered, syntax-highlighted HTML. */
  html: string;
  toc: TocEntry[];
};

// Drafts are authorable locally but never shipped.
const INCLUDE_DRAFTS = process.env.NODE_ENV === 'development';

/**
 * YAML turns an unquoted `2026-06-18` into a Date, not a string. Normalise
 * both forms to an ISO date so callers never have to care which was written.
 */
function normaliseDate(value: unknown, slug: string, field: string): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) {
    return value;
  }
  throw new Error(
    `content/blog/${slug}.md has an unparseable ${field}: ${String(value)}`
  );
}

function assertFrontmatter(
  data: Record<string, unknown>,
  slug: string
): PostFrontmatter {
  const missing = (['title', 'description'] as const).filter(
    k => typeof data[k] !== 'string' || !(data[k] as string).trim()
  );
  if (data.date === undefined) missing.push('date' as never);
  if (missing.length) {
    throw new Error(
      `content/blog/${slug}.md is missing frontmatter: ${missing.join(', ')}`
    );
  }

  return {
    ...(data as PostFrontmatter),
    date: normaliseDate(data.date, slug, 'date'),
    updated:
      data.updated === undefined
        ? undefined
        : normaliseDate(data.updated, slug, 'updated'),
  };
}

function readPostFile(slug: string) {
  const file = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const frontmatter = assertFrontmatter(data, slug);
  return { frontmatter, content };
}

function toMeta(
  slug: string,
  frontmatter: PostFrontmatter,
  content: string
): PostMeta {
  const stats = readingTime(content);
  return {
    ...frontmatter,
    slug,
    tags: frontmatter.tags ?? [],
    readingTime: stats.text,
    wordCount: stats.words,
  };
}

/** Every slug on disk, drafts included. */
function allSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
}

/**
 * Headings become the table of contents. They are slugged the same way
 * rehype-slug does, so the ids match the anchors in the rendered HTML.
 *
 * Fenced code blocks are stripped first — a `# comment` inside a shell
 * snippet is not a heading.
 */
function extractToc(content: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const withoutCode = content.replace(/^```[\s\S]*?^```/gm, '');

  const toc: TocEntry[] = [];
  for (const line of withoutCode.split('\n')) {
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    // Strip inline markdown so the TOC reads as plain text.
    const text = match[2]
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
    toc.push({
      id: slugger.slug(text),
      text,
      depth: match[1].length as 2 | 3,
    });
  }
  return toc;
}

// Typed separately: inline object literals make unified's `.use` overload
// resolution collapse across a chain this long.
const autolinkOptions: AutolinkOptions = {
  behavior: 'wrap',
  properties: { className: ['headingAnchor'] },
};

const prettyCodeOptions: PrettyCodeOptions = {
  theme: 'github-dark-default',
  // The site supplies the code background; Shiki's would clash.
  keepBackground: false,
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, autolinkOptions)
  .use(rehypePrettyCode, prettyCodeOptions)
  .use(rehypeStringify);

async function renderMarkdown(content: string): Promise<string> {
  const file = await processor.process(content);
  return String(file);
}

/** Newest first. Drafts excluded outside development. */
export function getAllPosts(): PostMeta[] {
  return allSlugs()
    .map(slug => {
      const read = readPostFile(slug);
      if (!read) return null;
      return toMeta(slug, read.frontmatter, read.content);
    })
    .filter((p): p is PostMeta => p !== null)
    .filter(p => INCLUDE_DRAFTS || !p.draft)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

/** Featured posts first, then the rest — both newest first. */
export function getSortedPosts(): PostMeta[] {
  const posts = getAllPosts();
  return [...posts.filter(p => p.featured), ...posts.filter(p => !p.featured)];
}

export async function getPost(slug: string): Promise<Post | null> {
  const read = readPostFile(slug);
  if (!read) return null;
  if (read.frontmatter.draft && !INCLUDE_DRAFTS) return null;

  const meta = toMeta(slug, read.frontmatter, read.content);
  return {
    ...meta,
    html: await renderMarkdown(read.content),
    toc: extractToc(read.content),
  };
}

/** Slugs for generateStaticParams — drafts never get a route in production. */
export function getPostSlugs(): string[] {
  return getAllPosts().map(p => p.slug);
}

export type TagCount = { tag: string; count: number };

/** Every tag in use, most-used first, then alphabetical. */
export function getAllTags(): TagCount[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** URL segment for a tag. "Next.js" → "next-js". */
export function tagSlug(tag: string): string {
  return new GithubSlugger().slug(tag);
}

/** Resolve a tag slug back to its display form, or null if unused. */
export function tagFromSlug(slug: string): string | null {
  return getAllTags().find(t => tagSlug(t.tag) === slug)?.tag ?? null;
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter(p => p.tags.includes(tag));
}

/**
 * Posts sharing the most tags with this one, newest first as a tiebreak.
 * Falls back to the most recent posts when nothing overlaps, so the slot
 * is never empty.
 */
export function getRelatedPosts(slug: string, limit = 2): PostMeta[] {
  const posts = getAllPosts();
  const current = posts.find(p => p.slug === slug);
  if (!current) return [];

  const others = posts.filter(p => p.slug !== slug);
  const scored = others
    .map(p => ({
      post: p,
      shared: p.tags.filter(t => current.tags.includes(t)).length,
    }))
    .filter(s => s.shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared || Date.parse(b.post.date) - Date.parse(a.post.date)
    )
    .map(s => s.post);

  if (scored.length >= limit) return scored.slice(0, limit);
  const filler = others.filter(p => !scored.includes(p));
  return [...scored, ...filler].slice(0, limit);
}

/** Previous (older) and next (newer) post in chronological order. */
export function getAdjacentPosts(slug: string): {
  prev: PostMeta | null;
  next: PostMeta | null;
} {
  const posts = getAllPosts(); // newest first
  const i = posts.findIndex(p => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    next: i > 0 ? posts[i - 1] : null,
    prev: i < posts.length - 1 ? posts[i + 1] : null,
  };
}

/** "9 July 2026" — pinned to UTC so server and client agree. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));
}
