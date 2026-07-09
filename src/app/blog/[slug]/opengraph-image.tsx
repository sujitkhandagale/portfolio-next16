import { ImageResponse } from 'next/og';
import { getPost, getPostSlugs, formatDate } from '@/lib/blogs';
import { profile } from '@/lib/data';

export const alt = 'Article preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return getPostSlugs().map(slug => ({ slug }));
}

/**
 * Per-post social card, rendered at build time. Kept to flat colours and
 * system-safe text so it needs no font fetch — the palette mirrors the
 * site tokens in globals.scss.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  const title = post?.title ?? 'Writing';
  const meta = post
    ? `${formatDate(post.date)} · ${post.readingTime}`
    : profile.role;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#0a0c11',
          backgroundImage:
            'radial-gradient(900px 500px at 85% -10%, rgba(99,102,241,0.30), transparent 60%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: '#6366f1',
            }}
          />
          <div style={{ color: '#8b91a4', fontSize: 26, letterSpacing: 2 }}>
            {profile.name.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              display: 'flex',
              color: '#e9ebf2',
              fontSize: title.length > 60 ? 62 : 76,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -2,
            }}
          >
            {title}
          </div>
          <div style={{ display: 'flex', color: '#f59e0b', fontSize: 28 }}>
            {meta}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            height: 6,
            width: 220,
            borderRadius: 999,
            background: '#6366f1',
          }}
        />
      </div>
    ),
    size
  );
}
