---
title: strict is not strict
description: TypeScript's strict flag turns on nine checks. The three that catch the bugs you actually ship are not among them, and create-next-app will never tell you.
date: 2026-07-09
tags: [TypeScript, Next.js, Tooling]
featured: false
---

Here is the `tsconfig.json` that `create-next-app` hands you, minus the parts nobody argues about:

```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true
  }
}
```

That `strict: true` is the reason you believe the code below is safe. It type-checks, it builds, it deploys, and it throws `TypeError: Cannot read properties of undefined` the first time a user visits a tag page that doesn't exist:

```ts
const post = posts.find(p => p.slug === slug);
const firstTag = post.tags[0];
```

You expect `strict` to catch the `post` line. It does — `post` is `Post | undefined`, that's `strictNullChecks` doing its job. So you fix it, ship, and the crash moves to the *second* half of the same line, where `post.tags[0]` is typed `string` and is, at runtime, `undefined`.

TypeScript let that through. Not as a bug. As a documented default.

## What `strict` actually turns on

Nine flags:

`alwaysStrict` · `noImplicitAny` · `noImplicitThis` · `strictBindCallApply` · `strictBuiltinIteratorReturn` · `strictFunctionTypes` · `strictNullChecks` · `strictPropertyInitialization` · `useUnknownInCatchVariables`

Read them as a group and the theme is obvious. Every one of them is about **making TypeScript enforce the types you already wrote.** You said this parameter is a `string`, so don't hand it a `number`. You declared the field non-optional, so initialize it. You wrote `catch (e)`, so `e` is `unknown` and not `any`.

That is a floor. It is not a ceiling, and it was never advertised as one. The flags that catch the *next* class of bug — the ones where the type you wrote is a lie the compiler has agreed to believe — are all opt-in, and `strict` does not enable a single one of them:

| Flag | Enabled by `strict`? |
| --- | --- |
| `noUncheckedIndexedAccess` | No |
| `exactOptionalPropertyTypes` | No |
| `noImplicitOverride` | No |
| `noPropertyAccessFromIndexSignature` | No |
| `noFallthroughCasesInSwitch` | No |
| `noImplicitReturns` | No |

They're excluded for backward compatibility, not because they're wrong. Turning them on breaks existing code, including code inside libraries you depend on. That is a real cost and a bad reason to skip them forever.

## `noUncheckedIndexedAccess` is the one that matters

Every array access and every index-signature read gets `| undefined` added to its type.

```ts
const tags: string[] = [];
const first = tags[0];
//    ^? string             — without the flag. A lie.
//    ^? string | undefined — with it. The truth.
```

TypeScript's array type says nothing about length. `string[]` means "an array of strings," including the empty one, and `arr[0]` on an empty array is `undefined` in every JavaScript engine ever written. Without this flag the compiler types that expression as `string` and moves on.

The same hole exists in every record you index by a key that came from user input:

```ts
const bySlug: Record<string, Post> = Object.fromEntries(/* ... */);
const post = bySlug[params.slug]; // Post. Always. Even for /blog/asdfgh.
```

Turn the flag on and both become `undefined`-tainted, the compiler starts asking you what happens when the lookup misses, and you answer the question once instead of finding out from Sentry.

The cost is real and it lands mostly in loops:

```ts
for (let i = 0; i < items.length; i++) {
  process(items[i]); // items[i] is T | undefined. The compiler cannot see the guard.
}
```

The compiler doesn't do the arithmetic that proves `i` is in range. Two honest fixes: iterate the values directly with `for (const item of items)`, which keeps the element type clean, or destructure with a guard when you genuinely need the index. In practice the flag pushes you toward `for...of`, `.map`, and `.entries()`, and the code gets better for reasons unrelated to types.

> If a flag's main cost is that it makes you stop writing C-style index loops in TypeScript, that is not a cost.

## `exactOptionalPropertyTypes` closes a hole you didn't know was open

Without it, `?` and `| undefined` are the same thing to TypeScript. They are not the same thing to JavaScript.

```ts
interface Options {
  cache?: boolean;
}

const opts: Options = { cache: undefined }; // allowed by default
```

`'cache' in opts` is `true`. `Object.keys(opts)` returns `['cache']`. Any code that distinguishes "absent" from "explicitly undefined" — and `Object.assign`, spread-based prop merging, and most option-merging helpers do — now takes the wrong branch. The property is *present*, and its value is garbage.

With the flag on, `{ cache: undefined }` is an error, and if you actually want to permit it you say so out loud: `cache?: boolean | undefined`.

Enable this one last. It requires you to have an opinion about your own data model, and half the time you'll discover you don't have one yet.

## The cheap three

Different category. These cost you nothing and you should turn them on this afternoon.

**`noFallthroughCasesInSwitch`** catches the missing `break`. It only fires on cases that have a body, so the deliberate `case 'a': case 'b':` stacking still works.

**`noImplicitOverride`** makes you write `override` when you override a base method. The bug it prevents is silent: someone renames the base method, your subclass method stops overriding anything and quietly becomes dead code that still compiles.

**`noPropertyAccessFromIndexSignature`** forces `env['API_URL']` over `env.API_URL` when the type is an index signature. Ugly on purpose. The dot implies a property that was declared somewhere; the bracket admits you are guessing at a key.

## About `skipLibCheck: true`

It's in your config, `create-next-app` put it there, and it means TypeScript never type-checks the `.d.ts` files in `node_modules`. Leave it on. Two conflicting versions of `@types/react` in a transitive dependency will otherwise produce hundreds of errors in code you cannot edit. The tradeoff — you don't catch a broken type definition until you call it — is the right one.

Just know that `strict: true, skipLibCheck: true` is not "strict TypeScript." It's "strict about my code, silent about everything I installed."

## Turning it on without stopping the world

The flags don't have to land together. Order them by errors-per-hour-of-fixing, worst first:

1. `noUncheckedIndexedAccess` — the most errors, and the most real bugs. Do it alone, in its own PR.
2. `noFallthroughCasesInSwitch`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature` — near-zero errors, one commit.
3. `noImplicitReturns` — a handful, mostly in functions that return a value on some paths and fall off the end on others.
4. `exactOptionalPropertyTypes` — last, once you know what your optional fields mean.

For step 1 on an existing codebase, run `tsc --noEmit` with the flag on and count before you commit to anything. A few dozen errors is an afternoon. Several hundred means you should fix them per-directory, and `git blame` the ones that look scary — an index access the compiler flags in code that has never crashed is either genuinely unreachable or a crash you haven't triggered yet. Both are worth knowing about.

## What I'd do differently

I turned on all six at once in a mid-sized app, got 340 errors, and spent the next two hours suppressing the boring ones with `!` to get back to a compiling state. Every `!` I typed that afternoon was me asserting a thing the compiler had just told me was false, and I had no way afterward to tell which assertions were reasoned and which were fatigue.

Non-null assertions and `as` casts are how you lose the entire value of the flags while keeping all of their cost. If a flag produces more errors than you can think about carefully, the flag is not the problem — the batch size is. One flag, one PR.

---

`strict: true` is not a finish line, it's the first nine checks of about fifteen. **The compiler will only refuse the lies you configured it to notice.** Start with `noUncheckedIndexedAccess`; it's the one standing between your array index and production.

Sources: [TSConfig Reference](https://www.typescriptlang.org/tsconfig/) · [`strict`](https://www.typescriptlang.org/tsconfig/strict.html)
