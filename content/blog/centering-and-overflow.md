---
title: Centering a div is easy. The hard part is what happens when it doesn't fit.
description: Every way to center is equivalent until the content outgrows the box. Then justify-content silently makes the top of your content unreachable, and margin auto doesn't.
date: 2026-07-09
tags: [CSS, Frontend, Flexbox, Layout]
featured: false
---

There is a genre of blog post that lists eight ways to center a div. Flexbox, grid, `place-items`, absolute plus transform, auto margins, `line-height`, tables, and one involving `calc()` that nobody has ever shipped. They all produce the same screenshot, so the post ranks them by character count and declares `place-items: center` the winner.

Every one of those methods centers correctly. They stop being equivalent the moment the content is taller than the box, and the post never mentions it, because the demo content was a 40px square.

## The bug

A modal. Fixed height, scrolls when the content is long, centered when it isn't.

```css
.overlay {
  display: grid;
  place-items: center;
  height: 100dvh;
  overflow: auto;
}
```

Short content sits in the middle. Long content scrolls. Ship it.

Then a user with a 600px-tall laptop opens the terms-of-service dialog, and the top third of it — the title, the close button — is above the viewport, and **no amount of scrolling will bring it back.** They can scroll *down* to the bottom of the content. Up is a wall. The content is there, in the box, laid out, painted nowhere.

## Scroll containers can't scroll backwards

A scroll container's origin is its start edge. `scrollTop: 0` means the top of the content. Negative scroll offsets do not exist.

When you center an item that overflows, it overflows **symmetrically** — half above the container's start edge, half below the end edge. The half past the end edge is reachable, because that's the direction scrolling goes. The half past the start edge is outside the scrollable overflow region entirely. It is not clipped in the sense of `overflow: hidden`; it's worse. The browser laid it out, painted it, and put it somewhere the scroll mechanism cannot address.

The CSS Box Alignment spec has a name for this. It calls it **data loss**, and it defines `safe` as the keyword that prevents it: if the chosen alignment would cause the item to overflow the alignment container and lose data, the item is aligned as if the alignment were `start` instead.

That's the tell. Alignment centering is a spec-level footgun with a spec-level opt-out, and the opt-out is not the default because changing the default would break pages that depend on the overflow.

## Not all eight methods do this

Here is where the listicles are actively wrong. These behave differently under overflow, and the difference is normative, not a browser quirk.

| Method | Overflows toward | Reachable? |
| --- | --- | --- |
| `justify-content: center` | both edges | start edge lost |
| `align-items: center` | both edges | start edge lost |
| `place-items: center` | both edges | start edge lost |
| `justify-content: safe center` | end edge only | yes |
| `margin: auto` on the child | end edge only | yes |
| `position: absolute` + `translate(-50%, -50%)` | both edges | no scroll at all |

Two of those need explaining.

### `margin: auto` is the one that was always correct

The flexbox spec, §8.1, in three sentences:

> During calculations of flex bases and flexible lengths, `auto` margins are treated as 0.
>
> Prior to alignment via `justify-content` and `align-self`, any positive free space is distributed to `auto` margins in that dimension.
>
> **Overflowing boxes ignore their `auto` margins and overflow in the end direction.**

Read that last line again. An auto margin only exists to absorb *positive* free space. When the free space goes negative — when the content is too big — the margins evaporate and the box overflows in the end direction, which is the direction you can scroll.

So this centers exactly like `place-items: center`, and degrades correctly:

```css
.overlay {
  display: flex;
  height: 100dvh;
  overflow: auto;
}

.modal {
  margin: auto; /* centers when it fits, hugs the start when it doesn't */
}
```

No media query, no `max-height` guess, no JavaScript measuring anything. The centering *is* the overflow behavior. This trick predates flexbox — `margin: 0 auto` on a block element has always resolved to zero when the block is wider than its containing block — and flexbox extended it to the block axis, where it's much more useful.

### `safe center` says the same thing out loud

```css
.overlay {
  display: grid;
  place-items: safe center;
  height: 100dvh;
  overflow: auto;
}
```

`safe` falls back to `start` on overflow. `unsafe` is the explicit opt-in to the old behavior, for the rare case where you want the item centered and genuinely don't care that half of it is unreachable — a decorative element in a clipped container, say.

Support landed across all three engines, but check your own targets before you rely on it; this is the kind of thing that quietly no-ops on an older Safari and takes the whole declaration with it. `margin: auto` needs no such check, which is the argument for reaching for it first.

### Absolute positioning is a different failure

```css
.modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

This one doesn't lose the start edge — it loses everything. The element is out of flow, so it contributes nothing to its ancestor's scrollable overflow area. The container has no idea the modal is 900px tall. There is no scrollbar to fail to scroll. The content past the viewport in *both* directions is simply gone.

People reach for this because it's the pattern they learned in 2015, when centering vertically was actually hard. It hasn't been hard for eight years.

## What I'd do differently

I debugged this exact bug for an hour with DevTools open on the wrong element. The overlay had `overflow: auto` and a scrollbar. The scrollbar *worked*. So I assumed the modal's height was wrong and went hunting through `max-height` and `dvh` and a `min-height: 0` I'd read about on a flexbox blog.

The thing I should have done first: scroll to the top, then run `document.querySelector('.overlay').scrollTop` in the console. It reads `0`. It was always `0`. The container thinks it's already at the top, because it *is* — the content above is not part of its scrollable overflow, and no property in the Styles panel is going to tell you that. `scrollTop: 0` with content visibly above the fold is the signature of this bug and nothing else produces it.

The other thing: I keep writing `place-items: center` because it's one line and it reads well. It's the right default for a fixed-size icon in a fixed-size button, where overflow is impossible by construction. It is the wrong default for anything sized by its content. **Centering something whose height you don't control is a decision about overflow, whether or not you make it.**

---

The listicle isn't wrong that eight methods center a div. It's wrong that the choice is aesthetic. **Ask what happens when it doesn't fit — the method that has an answer is the one you want.** Usually that's `margin: auto`.

Sources: [CSS Flexbox §8.1](https://drafts.csswg.org/css-flexbox-1/#auto-margins-align) · [`align-items` on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/align-items)
