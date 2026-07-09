import type { MetadataRoute } from 'next';
import { getAllPosts, getAllTags, tagSlug } from '@/lib/blogs';
import { projects } from '@/lib/data';
import { abs } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const newest = posts[0]?.date;

  return [
    { url: abs('/'), changeFrequency: 'monthly', priority: 1 },
    {
      url: abs('/blog'),
      lastModified: newest ? new Date(newest) : undefined,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...projects.map(p => ({
      url: abs(`/projects/${p.id}`),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...posts.map(p => ({
      url: abs(`/blog/${p.slug}`),
      lastModified: new Date(p.updated ?? p.date),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
    ...getAllTags().map(({ tag }) => ({
      url: abs(`/blog/tag/${tagSlug(tag)}`),
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    })),
  ];
}
