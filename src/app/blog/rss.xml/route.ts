import { getAllPosts } from '@/lib/blogs';
import { abs, site } from '@/lib/site';

export const dynamic = 'force-static';

/** XML text nodes must not carry raw markup characters. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const posts = getAllPosts();
  const updated = posts[0]?.date;

  const items = posts
    .map(post => {
      const url = abs(`/blog/${post.slug}`);
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.tags.map(t => `<category>${escapeXml(t)}</category>`).join('\n      ')}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.blog.title)}</title>
    <link>${abs('/blog')}</link>
    <description>${escapeXml(site.blog.description)}</description>
    <language>en</language>
    <atom:link href="${abs('/blog/rss.xml')}" rel="self" type="application/rss+xml" />
    ${updated ? `<lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>` : ''}
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
