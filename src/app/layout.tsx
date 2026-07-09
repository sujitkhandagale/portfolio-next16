import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import SmoothScroll from '@/components/SmoothScroll';
import { profile } from '@/lib/data';
import { abs, site } from '@/lib/site';
import './globals.scss';
import { SpeedInsights } from '@vercel/speed-insights/next';

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  // Absolute base for OG/Twitter/canonical URLs. Without it Next emits
  // relative ones, which crawlers and social scrapers reject.
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    // Page titles render as "Post title — Sujit Khandagale".
    template: `%s — ${profile.name}`,
  },
  description: profile.tagline,
  authors: [{ name: profile.name, url: site.url }],
  creator: profile.name,
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': abs('/blog/rss.xml') },
  },
  openGraph: {
    siteName: site.name,
    locale: site.locale,
    title: site.title,
    description: profile.tagline,
    url: site.url,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: profile.tagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SpeedInsights />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
