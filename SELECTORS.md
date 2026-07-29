# Selectors

All DOM selectors and extraction heuristics live in
[`src/content/selectors.ts`](src/content/selectors.ts) and
[`src/content/extract.ts`](src/content/extract.ts). LinkedIn ships no
stable public DOM contract for its feed — this document exists so
re-deriving them doesn't require repeating the whole investigation from
scratch.

## Current state (last re-derived against a live feed)

LinkedIn's feed CSS classes are **build-scoped hashes** (CSS-Modules
style, e.g. `_612e1a1c`, `c8dab43f`) that regenerate on every deploy and
carry no semantic meaning at all — not renamed, procedurally
regenerated. There is nothing left to select by class name. LinkedIn also
no longer exposes a literal `urn:li:activity:...` string anywhere in the
DOM (it used to be on a `data-urn`/`data-id` attribute; that's gone).

What turned out to be durable instead: **accessibility attributes**.
Every real post has an overflow-menu button whose `aria-label` names the
author — `"Hide post by Jane Doe"` or `"Open control menu for post by
Jane Doe"`. That single fact does almost all the work now:

- **Post container**: `[role="listitem"]:has(button[aria-label^="Hide post by "], button[aria-label^="Open control menu for post by "])`
  — a `role="listitem"` alone also matches non-post list items elsewhere
  on the page (sidebar suggestions, etc.); requiring the hide/menu button
  as a descendant is what scopes it to actual posts.
- **Author name**: parsed directly out of that aria-label (strip the
  known prefix). See `extractAuthorName()` in `extract.ts`.
- **Per-post identity key**: the `componentkey` attribute on the
  `role="listitem"` element — an opaque hash, not a real URN, but stable
  enough for the in-memory match-result cache. See `getUrn()`.
- **Author headline**: LinkedIn renders name / connection-degree badge
  (`"• Following"`, `"• 2nd"`) / headline / timestamp (`"15m •"`) as
  sibling `<span>`s with **no class at all** inside the header block.
  They're told apart by content pattern, not structure —
  `extractAuthorHeadline()` walks the header's text-bearing spans in
  order and returns the first one that isn't the author's name, doesn't
  look like a connection badge, and doesn't look like a timestamp.
- **Post body text**: same problem — the wrapping element has a hashed
  class and nothing else to key on. `extractPostText()` instead finds the
  largest "self-contained" text block in the post (an element whose own
  aggregated text clears ~40 characters but none of whose *direct
  children* individually do — i.e. the tightest wrapper around that text
  run), skipping LinkedIn's screen-reader-only duplicate spans (some
  attached content, like a structured job-details card, repeats its title
  twice back-to-back in `textContent` — detected cheaply by checking if a
  candidate string is literally two identical halves).

The old class-name-based selector chains (`.feed-shared-update-v2`,
`.update-components-text`, etc.) are kept as trailing fallbacks in
`selectors.ts` in case a rollout segment still serves the older markup,
but they are not expected to match current LinkedIn.

## How to tell it's gone stale again

`src/content/staleness.ts` tracks scan passes where the
`MutationObserver` saw new nodes but either the container selector
matched nothing, or every matched container yielded empty post text.
After a few consecutive stale-looking passes it shows a dismissible
notice in the top-right corner of the page pointing back here.

You can also check manually: the options page's "Test against sample
text" box runs the same `evaluatePost()` the feed uses — if matching
looks fine there but nothing on the real feed ever gets decorated, the
problem is extraction, not the regex rules.

## How to re-derive it when it breaks again

Chrome DevTools' own element picker (**Cmd/Ctrl+Shift+C**, or the
cursor-in-a-box icon top-left of the panel) sidesteps LinkedIn's
right-click handling. Click it, then click directly on a piece of real
post text — that jumps the Elements panel straight to it.

From there, the fastest path is the console, not manual tree-walking —
run scripts directly in DevTools → Console (type `allow pasting` first if
Chrome blocks the paste). This is the actual sequence that produced the
findings above:

**1. Confirm you're looking at the real feed, not an empty/loading shell:**
```js
console.log(location.href, document.querySelectorAll('*').length);
```

**2. Check whether class names are still hashed:**
```js
const classes = new Set();
document.querySelectorAll('div[class]').forEach(el =>
  el.className.split(/\s+/).forEach(c => c && classes.add(c))
);
console.log([...classes].slice(0, 20));
```
If these look like `_5034039a` / `c972d214` rather than words, class-based
selectors are a dead end — skip straight to step 3.

**3. Find a post via its overflow-menu button** (this is the durable
anchor — start here instead of guessing container classes):
```js
const btn = document.querySelector('button[aria-label^="Hide post by "], button[aria-label^="Open control menu for post by "]');
console.log(btn?.getAttribute('aria-label'));
const post = btn?.closest('[role="listitem"]') ?? btn?.closest('div');
console.log(post?.getAttribute('componentkey'), post?.getAttribute('role'));
```
If `role="listitem"` isn't the right ancestor anymore, walk `parentElement`
a few times from `btn` and log each ancestor's `tagName`/attributes to
find whatever replaced it — the key point is anchoring off the button,
not guessing container structure from scratch.

**4. Dump the header's text-bearing spans**, to check whether
name/badge/headline/timestamp are still unstyled siblings distinguished
only by pattern:
```js
[...post.querySelectorAll('*')]
  .map(el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('').trim())
  .filter(Boolean)
  .forEach((t, i) => console.log(i, t));
```
Update `CONNECTION_BADGE_PATTERN` / `TIMESTAMP_PATTERN` in `extract.ts` if
the badge/timestamp phrasing changed shape.

**5. Confirm the post-body heuristic still finds the right block** — the
easiest check is just reloading the unpacked extension and watching
whether real posts get decorated; if not, temporarily log the output of
`findPostBodyText()` for a post you know should match.

## Known fragility, by design

- Nothing here is expected to survive a LinkedIn redesign indefinitely.
  That's why matching logic (`src/core/`) has zero knowledge of DOM
  structure — only `extract.ts`/`selectors.ts` need to change when
  LinkedIn changes.
- The extraction strategy leans on *behavior* (an overflow menu every
  post has, accessibility labels, text-length heuristics) rather than
  *appearance* (classes), on the theory that behavior/accessibility
  surface changes less often than a CSS build's hash output — but that's
  a bet, not a guarantee.
- We deliberately don't try to be cleverer than this (no OCR, no ML
  layout guessing) — a wrong guess that silently mis-extracts is worse
  than a visible "selectors look stale" notice.
