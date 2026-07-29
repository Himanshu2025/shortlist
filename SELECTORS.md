# Selectors

All DOM selectors live in one file, [`src/content/selectors.ts`](src/content/selectors.ts).
LinkedIn ships no stable public DOM contract for its feed — class names get
renamed and restructured periodically as they ship changes, with no
notice and no versioning. **These selectors will break.** This document
exists so re-deriving them doesn't require re-reading the whole content
script from scratch.

Each selector is a fallback *chain*: `queryAllChain` / `queryOneChain` try
each entry in order and use the first one that returns anything. That
buys some resilience across LinkedIn's A/B tests and gradual rollouts,
but not against a full markup rewrite — when that happens, every entry in
a chain can go stale at once.

## What each chain is for

| Chain | Purpose |
|---|---|
| `POST_CONTAINER_SELECTORS` | Finds each post's root DOM node in the feed. Everything else queries *within* one of these. |
| `URN_ATTRIBUTE_SELECTORS` | Fallback lookup for the `urn:li:activity:...` identifier when it isn't on the container itself but on a nested child. |
| `POST_TEXT_SELECTORS` | The post body's text container — read via `textContent`, not visible text, since LinkedIn clamps long posts behind "…see more" purely with CSS. |
| `AUTHOR_NAME_SELECTORS` | The post author's display name. |
| `AUTHOR_HEADLINE_SELECTORS` | The author's headline/title (e.g. "Technical Recruiter at Acme") — this is what `recruiterTerms` matches against. |

## How to tell they've gone stale

The extension self-reports this: `src/content/staleness.ts` tracks scan
passes where the `MutationObserver` saw new nodes but either
`POST_CONTAINER_SELECTORS` matched nothing, or every matched container
yielded empty post text. After a few consecutive stale-looking passes, it
shows a dismissible notice in the top-right corner of the page pointing
back here.

You can also check manually: open the options page's "Test against sample
text" box — if matching itself looks fine on pasted text but nothing on
the real feed ever gets decorated, the problem is extraction, not the
regex rules.

## How to re-derive a selector

1. Open `https://www.linkedin.com/feed/` and let a good number of posts
   load.
2. Open DevTools → Elements, and inspect a post you can see is (a) an
   ordinary post, (b) ideally one you're confident should match your
   rules, to sanity-check end to end.
3. Walk *up* from the text you clicked until you find the element that
   wraps the whole post — comments, reactions, author block, and body all
   inside it. Note its most stable-looking attribute. In order of
   preference:
   - `data-urn` or `data-id` starting with `urn:li:activity:` — most
     stable, since it's semantic rather than a generated class name.
   - A class name that reads as intentional/semantic (e.g. containing
     `update`, `feed-shared`, `actor`) rather than one that looks
     generated/hashed.
4. Add the new selector as the **first** entry in the relevant chain in
   `selectors.ts`, leaving the old ones after it — that way if LinkedIn
   only rolled the change out to a subset of accounts or is A/B testing,
   the fallback still covers people who haven't seen it yet.
5. Repeat for the text container, author name, and author headline
   *within* that post element (`container.querySelector(...)` in
   DevTools' console is the fastest way to check a candidate selector
   actually resolves to the right node).
6. Run `npm run build`, reload the unpacked extension, and confirm real
   posts start getting decorated again — and that the stale-selectors
   notice stops appearing.

## Known fragility, by design

- No selector here is expected to survive a LinkedIn redesign
  indefinitely. That's why matching logic (`src/core/`) has zero
  knowledge of DOM structure — only `extract.ts` needs to change when
  LinkedIn changes.
- We deliberately don't try to be clever about it (no heuristic "find the
  biggest text block" fallback) — a wrong guess that silently
  mis-extracts is worse than a visible "selectors look stale" notice.
