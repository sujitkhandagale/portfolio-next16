---
title: Durable jobs with BullMQ, or how to survive a deploy mid-giveaway
description: Scheduled work is the part of a Discord bot that breaks quietly. Here is how Strom models timed actions as idempotent BullMQ jobs that a restart cannot lose.
date: 2026-06-18
tags: [Node.js, BullMQ, Redis, Architecture]
featured: true
---

Every Discord bot starts the same way. Someone types `!mute @nuisance 10m`, you call `setTimeout`, and ten minutes later the mute lifts. It works on your laptop. It works in staging. Then you deploy at the nine-minute mark and the mute never lifts, because `setTimeout` lived in a process that no longer exists.

The interesting problem in Strom was never the Discord API. It was time.

## Why in-process timers lose

A timer is state stored in the least durable place you own: the heap of a process you intend to restart. That's fine for a debounce. It is not fine for anything a user can observe.

Three things go wrong, in increasing order of embarrassment:

1. **A deploy drops the timer.** The mute never lifts, the giveaway never draws.
2. **A crash drops every timer at once.** You find out from a bug report.
3. **A recovery replays them.** You bolt on a "re-schedule everything from the database on boot" routine, get the idempotency wrong, and draw the same giveaway twice.

The third is worse than the first two, because it looks like a fix.

## Move the schedule out of the process

The fix is to stop treating "in ten minutes" as a timer and start treating it as a *job*: a durable record, owned by something that outlives the process. In Strom that's [BullMQ](https://docs.bullmq.io) backed by Redis.

```ts
import { Queue } from 'bullmq';

const moderation = new Queue('moderation', { connection });

await moderation.add(
  'unmute',
  { guildId, userId },
  {
    // The whole point: Redis owns this, not the heap.
    delay: durationMs,
    // A stable id makes a duplicate enqueue a no-op.
    jobId: `unmute:${guildId}:${userId}`,
    removeOnComplete: true,
    attempts: 3,
    backoff: { type: 'exponential', delay: 1_000 },
  }
);
```

The `jobId` is doing more work than it looks. BullMQ refuses to add a second job with an id that already exists, so a double-click, a retried command, and a boot-time reconciliation sweep all collapse into one scheduled action.

## Idempotency is a property of the handler, not the queue

A durable queue guarantees *at least once*, never *exactly once*. The network can drop an ack after the work is done; the job comes back. So the handler has to be safe to run twice.

The trick is to make the handler's first act a state transition it can only win once:

```ts
worker.process('unmute', async job => {
  const { guildId, userId } = job.data;

  // Only one caller can flip active → false. A replay finds zero rows
  // and returns early, having done nothing.
  const claimed = await Mute.findOneAndUpdate(
    { guildId, userId, active: true },
    { $set: { active: false, liftedAt: new Date() } }
  );
  if (!claimed) return;

  await discord.removeRole(guildId, userId, claimed.roleId);
});
```

Note what this *doesn't* do. It doesn't check `if (alreadyUnmuted) return` and then unmute, because those are two statements and the world can change between them. The conditional lives inside the update, where the database can enforce it.

> A retry that finds nothing to do and exits cleanly is not a failure. It is the system working.

### What about the Discord call?

`removeRole` is still not idempotent in the strict sense — it can 404 if a moderator removed the role by hand. That's fine. Treat "the desired end state already holds" as success:

```ts
try {
  await discord.removeRole(guildId, userId, roleId);
} catch (err) {
  if (err.status !== 404) throw err;
}
```

## The table that made it click

Once the schedule lives in Redis, every timed feature in the bot is the same shape. The differences are cosmetic:

| Feature    | Trigger        | Delay      | Idempotency key              |
| ---------- | -------------- | ---------- | ---------------------------- |
| Tempban    | `/ban ... 7d`  | 7 days     | `unban:{guild}:{user}`       |
| Giveaway   | `/giveaway`    | until ends | `draw:{messageId}`           |
| Reminder   | `/remind`      | arbitrary  | `remind:{userId}:{nonce}`    |
| Auto-purge | config toggle  | recurring  | `purge:{channelId}:{window}` |

Four features, one mechanism. Adding the fifth took an afternoon.

## What I'd do differently

I reached for `attempts: 3` with exponential backoff everywhere, reflexively. For a giveaway draw that's correct. For a reminder that fires into a channel the bot was kicked from, three attempts is three identical failures and a noisy log. Retries should be a decision per job type, not a default sprinkled across the codebase.

The other thing: I put `removeOnComplete: true` on everything early, which felt tidy and cost me an afternoon of debugging when I wanted to know whether a job had *ever* run. Keep a bounded history — `removeOnComplete: { count: 1000 }` — and you get an audit log for free.

---

The whole change is one sentence long: **stop storing the future in a variable.** Everything else follows.
