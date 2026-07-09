// ------------------------------------------------------------------
// All site content lives here. Edit this file and the whole portfolio
// updates — nothing is hardcoded in the components.
// ------------------------------------------------------------------

export const profile = {
  name: "Sujit Khandagale",
  role: "Software Engineer",
  // One line for the hero — keep it short and specific.
  tagline: "I build products end to end — from Discord infrastructure to the dashboards that run it.",
  location: "India · IST",
  email: "code.sujit.developer@gmail.com",
  socials: {
    github: "https://github.com/sujitkhandagale",
    linkedin: "https://linkedin.com/in/khandagale-sujit/",
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
    { value: "3+", label: "years shipping" },
    { value: "40+", label: "modules built" },
    { value: "∞", label: "refactors" },
  ],
};

/** One frame in a project's gallery. Omit `src` to render a placeholder. */
export type Screenshot = {
  src?: string;
  caption: string;
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
    id: "strom-bot",
    index: "01",
    title: "Strom Bot",
    subtitle: "A Discord platform that runs itself while you sleep.",
    summary:
      "A multi-purpose Discord platform: moderation, leveling, giveaways, music, tickets and a real-time dashboard. Node.js + Discord.js v14 backend with a BullMQ job pipeline, wired to a Next.js/TypeScript control panel.",
    tags: ["Next.js", "TypeScript", "Node.js", "Mongoose", "BullMQ"],
    year: "2026",
    href: "https://strombot.com",
    featured: true,
    role: "Solo — architecture, backend, frontend",
    timeline: "2024 — present",
    status: "Live",
    overview: [
      "Strom Bot started as a single moderation command and turned into a platform. Today it runs moderation, leveling, giveaways, music, ticketing and a live dashboard across every server that invites it — one Node.js process fanning work out to a queue rather than blocking the gateway.",
      "The interesting problem was never the Discord API; it was time. Giveaways end, mutes expire, reminders fire, and every one of those has to survive a deploy. A BullMQ pipeline backed by Redis owns all scheduled work, so a restart replays exactly what it should and nothing it shouldn't.",
      "The dashboard is a Next.js app that reads the same Mongoose models the bot writes, so there is a single definition of what a guild's config means. Changing a setting in the browser and watching the bot honour it a second later is the whole product in one gesture.",
    ],
    highlights: [
      {
        title: "Durable job pipeline",
        body: "BullMQ + Redis own every timed action — giveaway draws, tempbans, reminders. Jobs are idempotent and survive restarts, so a deploy mid-giveaway is a non-event.",
      },
      {
        title: "Shared type surface",
        body: "The bot and the dashboard import the same Mongoose schemas and TypeScript types. A config field cannot drift between what the UI writes and what the runtime reads.",
      },
      {
        title: "Sharded gateway",
        body: "Discord.js v14 sharding with a lightweight IPC layer, so per-guild caches stay warm and the dashboard can query live state without hitting the Discord API.",
      },
      {
        title: "Forty-plus modules",
        body: "Each feature is a self-registering module with its own commands, events and settings schema. Adding one touches exactly one directory.",
      },
    ],
    stack: [
      { group: "Frontend", items: ["Next.js", "TypeScript", "SCSS Modules"] },
      { group: "Backend", items: ["Node.js", "Discord.js v14", "BullMQ"] },
      { group: "Data", items: ["MongoDB", "Mongoose", "Redis"] },
      { group: "Infra", items: ["Docker", "Vercel", "Railway"] },
    ],
    screenshots: [
      { caption: "Server overview — live member and activity counters." },
      { caption: "Module registry: forty-plus features, toggled per guild." },
      { caption: "The giveaway scheduler, backed by the BullMQ queue." },
      { caption: "Audit log stream with rollback on destructive actions." },
    ],
  },
  {
    id: "dashboard",
    index: "02",
    title: "Dispatch Console Dashboard",
    subtitle: "An admin surface built like an instrument panel.",
    summary:
      "A modular admin surface with an entitlement ledger, animated 0fr→1fr row reveals, and security modules like Anti-Nuke and Night Mode built on a consistent 'dispatch console' design language.",
    tags: ["Next.js", "SCSS Modules", "Design System"],
    year: "2026",
    featured: true,
    role: "Design system + frontend",
    timeline: "2025 — present",
    status: "Live",
    overview: [
      "Most dashboards are a table and a hope. This one is designed around a single metaphor — a dispatch console — where every module is a panel, every destructive action is confirmed in place, and nothing ever navigates you away from the thing you were looking at.",
      "The design language is enforced in code rather than in a Figma file: tokens for surface, border, signal and glow; a fixed set of panel primitives; and an entitlement ledger that decides which panels a given plan may even render. Adding a module means composing primitives, not inventing new ones.",
      "The motion is the part people notice. Rows expand with a grid-template-rows 0fr→1fr transition instead of a measured max-height, so content of any size opens smoothly and collapses without the classic snap at the end.",
    ],
    highlights: [
      {
        title: "Entitlement ledger",
        body: "A single source of truth mapping plan → feature → limit. The UI, the API and the bot all ask the same ledger, so an upsell prompt and a 403 can never disagree.",
      },
      {
        title: "0fr → 1fr row reveals",
        body: "Expandable rows animate on grid-template-rows rather than max-height. No magic pixel numbers, no easing that stalls, works for one line or forty.",
      },
      {
        title: "Anti-Nuke & Night Mode",
        body: "Security modules with rate-limited trip conditions and a dry-run mode, so an admin can watch what would have happened before arming it.",
      },
    ],
    stack: [
      { group: "Frontend", items: ["Next.js", "React", "TypeScript"] },
      { group: "Styling", items: ["SCSS Modules", "Design tokens", "GSAP"] },
      { group: "Patterns", items: ["Server Components", "Optimistic UI"] },
    ],
    screenshots: [
      { caption: "The console shell — panels, not pages." },
      { caption: "Entitlement ledger resolving a plan to its limits." },
      { caption: "Anti-Nuke trip conditions in dry-run mode." },
    ],
  },
  {
    id: "payments",
    index: "03",
    title: "Razorpay Integration",
    subtitle: "A payment flow that fails loudly and recovers quietly.",
    summary:
      "End-to-end payment flow: a granular PaymentStatus state machine, HMAC-SHA256 verification, a backend queue drain with auto-cleanup, and browser-compat fixes for in-app and legacy browsers.",
    tags: ["Next.js", "Razorpay", "Node.js"],
    year: "2025",
    role: "Solo — backend + checkout UI",
    timeline: "2025",
    status: "Shipped",
    overview: [
      "Payments are the one flow where 'mostly works' is indistinguishable from broken. This integration models the whole lifecycle as an explicit PaymentStatus state machine — created, attempted, verified, captured, reconciled, failed — with every transition written before the side effect it authorises.",
      "Webhooks are verified with HMAC-SHA256 against the raw request body, never the parsed one, and every event is deduplicated by payment id so a retried delivery is a no-op. A backend drain sweeps abandoned intents, releases their reservations, and cleans up after itself.",
      "The last twenty percent was browsers. Discord's in-app webview, older Android WebViews and a handful of ad blockers all break the checkout iframe differently, so the flow degrades to a full-page redirect when the modal cannot be trusted to render.",
    ],
    highlights: [
      {
        title: "Explicit state machine",
        body: "PaymentStatus transitions are the only way state changes. An illegal transition throws rather than silently correcting itself, which turned a class of race conditions into loud test failures.",
      },
      {
        title: "Raw-body HMAC verification",
        body: "Webhook signatures are checked against the untouched request body with a timing-safe compare, and every event is idempotent by payment id.",
      },
      {
        title: "Self-cleaning queue drain",
        body: "Abandoned intents expire on a schedule, release their held entitlements and remove their own job records — no cron file, no orphan rows.",
      },
      {
        title: "Webview fallbacks",
        body: "Feature-detects the checkout iframe and falls back to a redirect flow in in-app browsers, so a payment never dead-ends on a blank modal.",
      },
    ],
    stack: [
      { group: "Frontend", items: ["Next.js", "TypeScript"] },
      { group: "Backend", items: ["Node.js", "Razorpay SDK", "Webhooks"] },
      { group: "Data", items: ["MongoDB", "Redis"] },
      { group: "Security", items: ["HMAC-SHA256", "Idempotency keys"] },
    ],
    screenshots: [
      { caption: "Checkout, with the redirect fallback path highlighted." },
      { caption: "PaymentStatus transitions rendered as a state diagram." },
      { caption: "Webhook inspector — signature, dedupe key, outcome." },
    ],
  },
  {
    id: "instaff",
    index: "04",
    title: "instaFF Framework",
    subtitle: "A FiveM roleplay framework written from an empty file.",
    summary:
      "A FiveM roleplay framework written from scratch in Lua — core player registry, server callbacks, client bootstrap, and a slot+weight inventory with a NUI drag-and-drop interface.",
    tags: ["Lua", "FiveM", "NUI"],
    year: "2025",
    role: "Solo — framework author",
    timeline: "2024 — 2025",
    status: "Archived",
    overview: [
      "instaFF is a roleplay framework for FiveM built without inheriting anyone else's assumptions. The core is a player registry: one authoritative server-side table, mirrored to clients only as far as each client is allowed to see, with every mutation going through a callback rather than a global.",
      "The inventory is where the design earns its keep. Items carry both a slot cost and a weight, so a character can be limited by bulk and by mass independently, and the NUI layer renders that as a drag-and-drop grid that feels like a game rather than a form.",
      "Writing it from scratch meant owning the boring parts too — a client bootstrap that survives a resource restart mid-session, and server callbacks with timeouts so a dropped player never leaves a promise hanging.",
    ],
    highlights: [
      {
        title: "Authoritative player registry",
        body: "The server holds the only real copy of player state. Clients receive projections, so a modified client can lie to itself and nowhere else.",
      },
      {
        title: "Slot + weight inventory",
        body: "Two independent constraints per item, resolved on the server before the NUI ever animates the drop. The UI is optimistic; the rules are not.",
      },
      {
        title: "Timeout-safe callbacks",
        body: "Server callbacks resolve or reject within a bounded window, so a disconnect mid-request cannot strand the caller.",
      },
    ],
    stack: [
      { group: "Core", items: ["Lua", "FiveM", "CFX natives"] },
      { group: "Interface", items: ["NUI", "HTML/CSS", "Vanilla JS"] },
      { group: "Data", items: ["MySQL", "oxmysql"] },
    ],
    screenshots: [
      { caption: "Drag-and-drop inventory grid, rendered in NUI." },
      { caption: "Slot and weight constraints resolving on the server." },
      { caption: "Client bootstrap surviving a mid-session restart." },
    ],
  },
];

/** Look up a project by its URL segment. */
export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

/** The project after this one, wrapping around — powers the detail-page footer. */
export function getNextProject(id: string): Project {
  const i = projects.findIndex((p) => p.id === id);
  return projects[(i + 1) % projects.length];
}

export type Skill = { group: string; items: string[] };

export const skills: Skill[] = [
  { group: "Languages", items: ["TypeScript", "JavaScript", "Lua", "SQL"] },
  { group: "Frontend", items: ["Next.js", "React", "GSAP", "SCSS Modules"] },
  { group: "Backend", items: ["Node.js", "Discord.js", "Mongoose", "BullMQ"] },
  { group: "Tooling", items: ["Git", "Docker", "Vercel", "Figma"] },
];
