// ------------------------------------------------------------------
// All site content lives here. Edit this file and the whole portfolio
// updates — nothing is hardcoded in the components.
// ------------------------------------------------------------------

export const profile = {
  name: 'Sujit Khandagale',
  role: 'Software Engineer',
  // One line for the hero — keep it short and specific.
  tagline:
    'I build products end to end — from Discord infrastructure to the dashboards that run it.',
  location: 'India · IST',
  email: 'code.sujit.developer@gmail.com',
  socials: {
    github: 'https://github.com/sujitkhandagale',
    linkedin: 'https://linkedin.com/in/khandagale-sujit/',
    x: '',
  },
};

export const about = {
  // 2–3 short paragraphs. Written in the first person.
  paragraphs: [
    "I'm a full-stack engineer who likes owning the whole surface of a product — the backend jobs that never sleep, the type system that keeps them honest, and the interface that makes it all feel effortless.",
    "Lately I've been building Strom Bot: a multi-purpose Discord platform with a Next.js dashboard, a Node.js job pipeline, and a design system I've iterated on obsessively. I care about the details most people scroll past.",
    "Outside of shipping, I'm usually reverse-engineering an animation I liked or tightening a component until it feels inevitable.",
  ],
  stats: [
    { value: '2', label: 'products shipped' },
    { value: '129', label: 'commands shipped' },
    { value: '∞', label: 'refactors' },
  ],
};

import type { StaticImageData } from 'next/image';

import stromHome from '@/assets/projects/strom/home.png';
import stromGuilds from '@/assets/projects/strom/guilds.png';
import stromDashboard from '@/assets/projects/strom/dashboard.png';
import stromCommands from '@/assets/projects/strom/commands.png';
import stromSpam from '@/assets/projects/strom/spam.png';
import stromVoice from '@/assets/projects/strom/voice-tracking.png';
import stromCareer from '@/assets/projects/strom/career.png';

import eventsHome from '@/assets/projects/eventsvibe/home.png';
import eventsCities from '@/assets/projects/eventsvibe/cities.png';
import eventsBookings from '@/assets/projects/eventsvibe/my_bookings.png';
import eventsAdmin from '@/assets/projects/eventsvibe/admin_dashboard.png';
import eventsBlogs from '@/assets/projects/eventsvibe/blogs.png';
import eventsBlogDetails from '@/assets/projects/eventsvibe/blog_details.png';

/**
 * One frame in a project's gallery. Omit `src` to render a gradient
 * placeholder. Images are statically imported so next/image can size,
 * optimise and blur them at build time.
 */
export type Screenshot = {
  src?: StaticImageData;
  caption: string;
  /** Falls back to the caption. Set it when the caption isn't descriptive. */
  alt?: string;
};

/** A labeled cluster of technologies, rendered in the detail page sidebar. */
export type StackGroup = { group: string; items: string[] };

export type Project = {
  /** Doubles as the URL segment: /projects/<id> */
  id: string;
  index: string; // shown as the monospace marker, e.g. "01"
  title: string;
  /** One clause under the title on the detail page. */
  subtitle: string;
  summary: string;
  tags: string[];
  year: string;
  href?: string; // live link
  repo?: string; // source link
  featured?: boolean;

  // --- detail page ------------------------------------------------
  role: string;
  timeline: string;
  status: string;
  /** Long-form overview. One string per paragraph. */
  overview: string[];
  /** The three or four things worth pointing at. */
  highlights: { title: string; body: string }[];
  stack: StackGroup[];
  /** Shown in the card slider (first few) and the detail gallery (all). */
  screenshots: Screenshot[];
};

export const projects: Project[] = [
  {
    id: 'strom',
    index: '01',
    title: 'Strom',
    subtitle: 'A Discord platform that runs itself while you sleep.',
    summary:
      'A multi-purpose Discord platform: moderation, leveling, giveaways, music, tickets and a real-time dashboard. Node.js + Discord.js v14 backend with a BullMQ job pipeline, wired to a Next.js/TypeScript control panel.',
    tags: ['Next.js', 'TypeScript', 'Node.js', 'Mongoose', 'BullMQ', 'Redis'],
    year: '2026',
    href: 'https://strombot.com',
    featured: true,
    role: 'Solo — architecture, backend, frontend',
    timeline: '2025 — present',
    status: 'Live',
    overview: [
      'Strom Bot started as a single moderation command and turned into a platform. Today it runs moderation, leveling, giveaways, music, ticketing and a live dashboard across every server that invites it — one Node.js process fanning work out to a queue rather than blocking the gateway.',
      "The interesting problem was never the Discord API; it was time. Giveaways end, mutes expire, reminders fire, and every one of those has to survive a deploy. A BullMQ pipeline backed by Redis owns all scheduled work, so a restart replays exactly what it should and nothing it shouldn't.",
      "The dashboard is a Next.js app that reads the same Mongoose models the bot writes, so there is a single definition of what a guild's config means. Changing a setting in the browser and watching the bot honour it a second later is the whole product in one gesture.",
    ],
    highlights: [
      {
        title: 'Durable job pipeline',
        body: 'BullMQ + Redis own every timed action — giveaway draws, tempbans, reminders. Jobs are idempotent and survive restarts, so a deploy mid-giveaway is a non-event.',
      },
      {
        title: 'Shared type surface',
        body: 'The bot and the dashboard import the same Mongoose schemas and TypeScript types. A config field cannot drift between what the UI writes and what the runtime reads.',
      },
      {
        title: 'Sharded gateway',
        body: 'Discord.js v14 sharding with a lightweight IPC layer, so per-guild caches stay warm and the dashboard can query live state without hitting the Discord API.',
      },
      {
        title: '129 commands, 12 modules',
        body: 'Each feature is a self-registering module with its own commands, events and settings schema. Adding one touches exactly one directory — and the command reference builds itself from the registry.',
      },
    ],
    stack: [
      { group: 'Frontend', items: ['Next.js', 'TypeScript', 'SCSS Modules'] },
      {
        group: 'Backend',
        items: ['Node.js', 'Discord.js v14', 'BullMQ'],
      },
      { group: 'Data', items: ['MongoDB', 'Mongoose', 'Redis'] },
      { group: 'Infra', items: ['Docker', 'Vercel', 'Railway'] },
    ],
    screenshots: [
      {
        src: stromHome,
        caption:
          'The landing page — one pitch, and the feature set as a row of chips.',
        alt: "Strom Bot marketing landing page, headline reading 'Your server, supercharged.'",
      },
      {
        src: stromGuilds,
        caption:
          'Server picker. Guilds are filtered by whether the bot is present, who owns them, and what you may manage.',
        alt: 'A grid of Discord servers, each with a member count and a Manage button.',
      },
      {
        src: stromDashboard,
        caption:
          'Guild overview: live member, channel and role counters, the command-prefix panel, and every module one click deep.',
        alt: 'Strom dashboard overview for a guild, showing stat cards and module tiles.',
      },
      {
        src: stromCommands,
        caption:
          '129 commands across 12 categories, filterable by permission and tier — each row expands to its full documentation.',
        alt: 'Command reference page listing slash commands grouped by category.',
      },
      {
        src: stromSpam,
        caption:
          'Spam protection. A look-back window and a message threshold define the trip condition; the punishment and its filters are configured beside it.',
        alt: 'Spam protection settings with time frame, threshold, auto-punishment and filters.',
      },
      {
        src: stromVoice,
        caption:
          'Voice tracking rolls raw session events into a weekly pulse, a leaderboard, and a per-member breakdown.',
        alt: 'Voice tracking analytics with a bar chart of weekly voice time and a standout member card.',
      },
      {
        src: stromCareer,
        caption:
          'The careers page, filtered by team and contract type — the same panel primitives as the dashboard.',
        alt: 'Strom careers page listing open roles with team and type filters.',
      },
    ],
  },
  {
    id: 'eventsvibe',
    index: '02',
    title: 'Events Vibe',
    subtitle:
      'An event management platform for the way India actually celebrates.',
    summary:
      'A city-first marketplace for weddings, birthdays, concerts and venues across India. Guests discover vendors and book them; vendors get orders; an admin console runs payments, refunds, settlements, tickets and an editorial blog behind it all.',
    tags: ['Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'Razorpay'],
    year: '2026',
    href: 'https://eventsvibe.in',
    featured: true,
    role: 'Solo — architecture, backend, frontend',
    timeline: '2025 — present',
    status: 'Live',
    overview: [
      'Booking a wedding photographer in Pune and booking a concert venue in Delhi look like the same transaction on paper and nothing alike in practice. Events Vibe is built around that gap: the city comes first, and everything downstream — which vendors exist, what they charge, which categories even make sense — is scoped to it.',
      'The consumer side is a discovery surface. Seven cities, a category grid that runs from photography and weddings to seminars, birthday parties and concerts, and a booking flow that ends in a real payment. Bookings live in a status track — upcoming, in progress, completed, cancelled — so a customer can always answer "what have I actually paid for" from one page.',
      'Behind it is an admin console that treats money as the primary object. Orders, paid orders, failed payments, refunds and settlements each get their own view, with order-status analytics plotted across the month. Vendors, users, support tickets and a full editorial blog with categories and authorship run through the same shell.',
    ],
    highlights: [
      {
        title: 'City-scoped catalogue',
        body: 'Location is chosen before anything else and threaded through every query. Vendors, categories and pricing resolve per city, so Mumbai and Kolkata are separate marketplaces wearing the same interface.',
      },
      {
        title: 'Money as a first-class view',
        body: 'The admin panel separates orders, paid orders, failed payments, refunds and settlements rather than collapsing them into one table. Razorpay webhooks reconcile against each, so a failed capture is visible rather than merely absent.',
      },
      {
        title: 'Bookings with a status track',
        body: 'Every reservation moves through upcoming → in progress → completed, or exits to cancelled. The customer, the vendor and the settlement ledger all read the same state.',
      },
      {
        title: 'Editorial as a module',
        body: 'A full blog — categories, authorship, likes, share targets and a trending feed — authored from the same admin console that handles refunds. Content is a feature of the marketplace, not a separate CMS bolted on.',
      },
    ],
    stack: [
      { group: 'Frontend', items: ['Next.js', 'React', 'TypeScript'] },
      { group: 'Backend', items: ['Node.js', 'REST API', 'Webhooks'] },
      { group: 'Data', items: ['MongoDB', 'Mongoose'] },
      { group: 'Payments', items: ['Razorpay', 'Refunds', 'Settlements'] },
    ],
    screenshots: [
      {
        src: eventsHome,
        caption:
          'The landing page. A city is picked before anything else — everything below it is scoped to that choice.',
        alt: "Events Vibe landing page with the headline 'Find your next event or plan the whole thing.'",
      },
      {
        src: eventsCities,
        caption:
          'Seven cities, then the category grid — photography, weddings, seminars, birthday parties, concerts.',
        alt: 'A grid of Indian cities above a row of event category cards.',
      },
      {
        src: eventsBookings,
        caption:
          'My Bookings: upcoming, in progress, completed and cancelled, with total spend across every reservation.',
        alt: 'Customer bookings page showing status filters and spend summary cards.',
      },
      {
        src: eventsAdmin,
        caption:
          'The admin console. Revenue, orders, failed payments, refunds and pending tickets, with order status plotted across the month.',
        alt: 'Admin dashboard with revenue cards, an order status chart and a recent activity panel.',
      },
      {
        src: eventsBlogs,
        caption:
          'The editorial surface — a featured carousel, browsable categories, and a trending feed.',
        alt: 'Events Vibe blog index with a featured article carousel and category cards.',
      },
      {
        src: eventsBlogDetails,
        caption:
          'An article, with likes, share targets and author attribution — all authored from the admin console.',
        alt: 'A blog article page with a hero image, share buttons and an author card.',
      },
    ],
  },
];

/** Look up a project by its URL segment. */
export function getProject(id: string): Project | undefined {
  return projects.find(p => p.id === id);
}

/** The project after this one, wrapping around — powers the detail-page footer. */
export function getNextProject(id: string): Project {
  const i = projects.findIndex(p => p.id === id);
  return projects[(i + 1) % projects.length];
}

export type Skill = { group: string; items: string[] };

// Four groups — the Skills grid is four columns at the large breakpoint.
export const skills: Skill[] = [
  { group: 'Languages', items: ['TypeScript', 'JavaScript'] },
  { group: 'Frontend', items: ['Next.js', 'React', 'GSAP', 'SCSS Modules'] },
  { group: 'Backend', items: ['Node.js', 'Discord.js', 'BullMQ', 'Razorpay'] },
  {
    group: 'Data & Tooling',
    items: ['MongoDB', 'Redis', 'Docker', 'Vercel', 'Git'],
  },
];
