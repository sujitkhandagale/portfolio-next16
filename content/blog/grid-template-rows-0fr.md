---
title: Animating to auto height, finally
description: max-height transitions have been the standard hack for a decade, and they have always been wrong. grid-template-rows 0fr → 1fr does the thing you actually meant.
date: 2026-05-02
tags: [CSS, Frontend, Animation]
featured: true
---

You want a row to expand when clicked. The content inside is of unknown height — one line today, forty after someone edits the copy. You write this, because everyone writes this:

```css
.panel {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.panel[data-open] {
  max-height: 500px; /* a number you invented */
}
```

And it *works*, in the sense that something moves. But look at what you just agreed to.

## The three lies of max-height

**The magic number is a bug with a delay.** `500px` is a guess about content you haven't written yet. The day someone pastes in a long paragraph, the panel clips. You bump it to `1000px`. Now you've made the second problem worse.

**The easing is a lie.** The transition animates `max-height` from `0` to `1000px` at a constant rate. But the content is only `180px` tall. So the panel reaches full height in the first 18% of the duration, and then you spend the remaining 82% animating an invisible box from `180px` to `1000px`. The close animation has the opposite problem: nothing appears to happen for most of it, then the panel slams shut. That "snap at the end" everyone accepts as the cost of doing business is not inherent. It's the magic number leaking into the timing function.

**`max-height: none` is not animatable**, so you can never simply say "be as tall as you are."

## What you meant to say

You meant: *this row should occupy zero of its available height, then all of it.* CSS Grid has a unit for a fraction of available space, and it turns out fractions are interpolatable.

```css
.panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.panel[data-open] {
  grid-template-rows: 1fr;
}

/* The child must be able to shrink to nothing. */
.panel > * {
  overflow: hidden;
  min-height: 0;
}
```

No number. No clipping. The easing curve maps onto the *actual* height of the *actual* content, so the motion reads correctly whether the panel holds one line or forty, and it collapses as smoothly as it opens.

## The two lines people miss

The `overflow: hidden` and `min-height: 0` on the **child** are not optional, and they are where every "this doesn't work for me" comes from.

- Grid items default to `min-height: auto`, meaning *never shrink below your content*. With that in force, `0fr` resolves to the content height and nothing animates.
- Without `overflow: hidden`, the content spills out of the zero-height track instead of being clipped by it.

Both belong on the child, not the grid container. Put them on the parent and you'll spend twenty minutes confused.

### It composes

Because the row is a grid track and not a height, you can animate opacity on the content in parallel and get a genuinely nice reveal:

```css
.panel > * {
  overflow: hidden;
  min-height: 0;
  opacity: 0;
  transition: opacity 0.25s ease 0.05s;
}

.panel[data-open] > * {
  opacity: 1;
}
```

## Support, and the honest caveat

Interpolating `grid-template-rows` shipped in Chrome 107, Firefox 129 and Safari 17.2. That's every evergreen browser as of 2026, but it is meaningfully newer than `max-height`. In a browser without it the panel simply appears and disappears without a transition — which is a degradation, not a break.

If you need the transition in older engines, the modern answer is not `max-height`; it's `calc-size(auto)` where available, or a `ResizeObserver` writing a real pixel height. Both are more machinery than most rows deserve.

> The lesson isn't really about grid. It's that "animate to auto" felt impossible for a decade because we kept animating a *constraint* on the height instead of the height itself.

---

I've since replaced every `max-height` accordion in the Strom dashboard with four lines of grid. The diff removed more code than it added, and the motion stopped feeling cheap.
