---
title: A payment flow that fails loudly
description: Payments are the one place where "mostly works" is indistinguishable from broken. An explicit state machine, raw-body HMAC verification, and what in-app browsers do to your checkout.
date: 2026-03-27
tags: [Payments, Node.js, Architecture, Security]
---

Most bugs let you off lightly. A dropped analytics event is a dropped analytics event. A payment that half-succeeded is a customer who has been charged and has nothing to show for it, and they will find you.

So the flow I built for Events Vibe assumes it will fail, and tries to fail somewhere I can see.

## Status is not a boolean

The first version of every payment integration has a field called `paid`. It is a lie, because it describes exactly one moment in a process with at least six.

```ts
type PaymentStatus =
  | 'created'    // we made an order, the user has seen nothing
  | 'attempted'  // checkout opened, user is entering details
  | 'authorized' // funds held, not captured
  | 'captured'   // money moved
  | 'failed'     // terminal, with a reason
  | 'refunded';  // money moved back
```

The value of writing them all down is that the illegal transitions become obvious. `refunded` can only follow `captured`. `authorized` can never follow `captured`. Once you can name them, you can enforce them:

```ts
const ALLOWED: Record<PaymentStatus, PaymentStatus[]> = {
  created: ['attempted', 'failed'],
  attempted: ['authorized', 'captured', 'failed'],
  authorized: ['captured', 'failed'],
  captured: ['refunded'],
  failed: [],
  refunded: [],
};

function transition(order: Order, next: PaymentStatus) {
  if (!ALLOWED[order.status].includes(next)) {
    // Loud. This is a bug in our code or a replayed webhook, and I
    // want to know which before the customer emails me.
    throw new IllegalTransition(order.id, order.status, next);
  }
  order.status = next;
}
```

Throwing here converted a class of race conditions into test failures. Before, a late `authorized` webhook arriving after `captured` would quietly walk the order backwards. Now it's an exception with both states in the message.

## Verify the body you received, not the body you parsed

Webhook signatures are computed over the exact bytes the provider sent. The moment `express.json()` touches the request, you have a JavaScript object, and re-serializing it gives you *a* JSON string — not necessarily *the* JSON string. Key order, unicode escaping, and whitespace all differ.

```ts
// The raw body must survive to the verification step.
app.post(
  '/webhooks/razorpay',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(req.body) // Buffer, untouched
      .digest('hex');

    const signature = req.get('x-razorpay-signature') ?? '';

    // Constant-time. A === comparison leaks the signature one byte at
    // a time to anyone willing to measure.
    const ok =
      expected.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

    if (!ok) return res.status(400).end();

    const event = JSON.parse(req.body.toString('utf8'));
    // …
  }
);
```

Two details worth dwelling on:

- `timingSafeEqual` **throws** if the buffers differ in length, which is why the length check comes first and short-circuits.
- The comparison is constant-time, but the length check is not. That's acceptable: the length of a hex SHA-256 digest is public knowledge.

### Then make the event idempotent

Providers retry. A delivery that timed out on your side gets sent again, and the second copy is byte-identical to the first. Dedupe on the provider's event id, not on your own understanding of what the event means:

```ts
const seen = await WebhookEvent.updateOne(
  { eventId: event.id },
  { $setOnInsert: { eventId: event.id, receivedAt: new Date() } },
  { upsert: true }
);

// matchedCount > 0 means we had already recorded this id.
if (seen.matchedCount > 0) return res.status(200).end();
```

Return `200`, not `409`. A duplicate is not an error from the provider's point of view, and a non-2xx just schedules another retry.

## The last twenty percent is browsers

Everything above is the part you can reason about. Then you ship, and the reports come in from users whose checkout modal never rendered.

The offenders, in rough order of how much time they cost me:

1. **In-app webviews.** Discord, Instagram and a long tail of Android apps open links in a webview where the payment iframe is blocked, third-party cookies are gone, or `window.open` is a no-op.
2. **Ad blockers**, which match the checkout script's URL against a filter list and take it out.
3. **Legacy Android WebView**, where the modal renders but the callback never fires.

There is no detecting your way out of this reliably. What works is refusing to depend on the modal:

```ts
// If the checkout script didn't load, or we're somewhere the iframe
// can't be trusted, hand off to a full-page redirect flow.
const canUseModal =
  typeof window.Razorpay === 'function' && !isInAppBrowser(navigator.userAgent);

if (canUseModal) {
  new window.Razorpay(options).open();
} else {
  window.location.href = await createRedirectCheckout(orderId);
}
```

> A payment must never dead-end on a blank modal. Degrading to a redirect costs the user one page load. Not degrading costs you the sale and a support ticket.

## The sweep

Finally: orders that reach `created` or `attempted` and stop. The user closed the tab. Nothing is wrong, exactly, but the inventory they reserved is still held.

A scheduled drain expires them, releases the reservation, and removes its own job record — no cron file to forget about, no orphan rows accumulating in a table nobody reads. It's the same [durable job](/blog/durable-jobs-with-bullmq) machinery the rest of the system uses.

---

None of this makes payments *safe*. It makes them **legible**: when something breaks, there is exactly one place the state can be wrong, and it says so out loud.
