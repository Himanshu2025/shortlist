# Shortlist

A Chrome extension (Manifest V3) that highlights hiring posts in your
LinkedIn feed that mention skills you care about, and collapses the ones that don't. It's a live view filter — it reads whatever's already on the page as you scroll, and doesn't remember or send anywhere what it saw.

Free and open source, MIT licensed.

## What this does and doesn't do with your data

**Does:**
- Reads the DOM of posts already rendered in your feed (because you
  scrolled to them) and runs regex matching against your configured skills
  and phrases, entirely in your browser.
- Stores your *settings* — skill list, aliases, locations, phrase lists,
  toggles — in `chrome.storage.local`, so they survive a browser restart.
- Lets you export/import that settings ruleset as JSON, for backing it up
  or moving it to another machine.

**Doesn't:**
- Make any network requests. There is no `host_permissions` entry, no
  background service worker, no offscreen document — nothing in this
  extension can reach a server even if it wanted to.
- Persist, cache, or export anything about the *posts* you see. The
  per-post match results live in an in-memory `Map` that's discarded the
  moment you close or reload the tab.
- Use `localStorage`, IndexedDB, or the clipboard for post content.
- Scrape, auto-scroll, open background tabs, or call LinkedIn's internal
  Voyager API. It only reads what your own scrolling already rendered.
- Run on your profile, anyone else's profile, or Sales Navigator — the
  content script is scoped to your main feed and the content search
  results page, nothing else.

The only permission requested is `"storage"`, and it's used for settings
only. That's the entire security posture, and it's enforced structurally
(no permission to violate it with), not just by convention.

## How matching works

Two synchronous, regex-only gates run on first sight of each post — no
model, no async, so there's no race and no scroll jump from a verdict
arriving late.

1. **Is this a hiring post?** The post body matches one of your configured
   hiring phrases AND none of your exclude phrases match. This is
   deliberately about the *post text*, not who's posting it — a founder or
   an engineer writing "we're hiring" is just as valid a signal as a
   recruiter, so there's no author/headline check gating this. The exclude
   list is what stops "congrats on landing your new React role" from being
   flagged just because it mentions React and "role".
2. **Does it name a skill you care about?** Each skill's name and aliases
   are compiled into a word-boundary-guarded regex, so "React" doesn't
   match "reactive" or "reaction", and a bare alias like "node" doesn't
   match inside a hyphenated compound like `some-node-service`. By default
   any one matched skill is enough (OR). Marking a skill "Required" in the
   options page switches that skill into an AND condition — all required
   skills must be named for a match, and any non-required skills become
   optional bonus chips rather than something that alone can trigger a match.

Nothing here is hardcoded — every phrase list and skill/alias mapping is
plain user data, edited from the options page, with "reset to defaults"
per section if you want to start over. Matching rules are compiled from
plain phrases you type, never raw regex, so a typo can't throw inside the
feed's `MutationObserver` or backtrack the tab into a freeze. Phrases and
extracted post text are both normalized for typographic quotes (LinkedIn
renders "we're" as "we’re"), so a phrase typed with a straight apostrophe
still matches text rendered with a curly one.

Seniority, work mode, sponsorship, and a salary figure/range are also
extracted by plain regex for display only — all four are nullable, since
most posts say nothing about them.

## Rendering

Matching posts get a small accent-bordered bar with matched-skill chips
(shown in monospace — they're literal query tokens) plus seniority/work
mode/sponsorship/salary if the post states them, and a short excerpt of
the post text around the first matched skill with that match highlighted.
That excerpt is rendered entirely inside our own shadow DOM bar, built from
text nodes (never `innerHTML`, since the post text is untrusted) — it never
touches LinkedIn's own post markup, for the same reason nothing else here
does (see below). Non-matching posts collapse to a one-line strip (author
name + a muted "no match" tag) that expands on click. Nothing is ever
removed from the page — LinkedIn's own post nodes stay mounted the whole
time, which is what avoids scroll jump in a virtualized feed.

The popup also reports how many matches the active tab has found so far —
a plain in-memory counter on the content script, read on demand via
`chrome.runtime` messaging (no new permission; not persisted, and reset on
reload same as everything here).

Chrome only injects content scripts into tabs that load *after* the
extension is installed, rebuilt, or re-enabled — a LinkedIn tab that was
already open won't have Shortlist running until it reloads. Rather than
add a background worker with `scripting`/`tabs` permissions to force that
(which this project deliberately doesn't have), the popup detects the
silent tab — the match-count ping goes unanswered — and offers a one-click
"Reload this tab" button instead of a background script doing it for you
unprompted, so an unsent post draft in the feed doesn't get lost.

All injected UI renders inside a Shadow DOM, so LinkedIn's CSS can't
restyle it and its own CSS can't leak into LinkedIn's layout.

## Getting started (load unpacked)

```bash
npm install
npm run build
```

Then in Chrome:

1. Go to `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select this project's `dist/` folder.
4. Open your LinkedIn feed — posts should start getting decorated as you
   scroll.
5. Click the Shortlist toolbar icon for a quick enable toggle, or
   **Open settings** for the full options page (skills, phrase lists, and
   a "test against sample text" box for debugging why a post did or
   didn't match).

Re-run `npm run build` after any change and click the refresh icon on the
extension's card in `chrome://extensions` to pick it up.

## Development

```bash
npm run test        # vitest, run once
npm run test:watch  # vitest, watch mode
npm run build        # tsc --noEmit, then both Vite builds
```

The matching logic (`src/core/`) is framework-free and has no `chrome.*`
or DOM dependency, so it's unit tested directly — see `src/tests/`.

## Project layout

```
src/
  core/      # pure matching logic — types, defaults, phrase compilation,
             # the two gates, facet extraction, ruleset JSON import/export.
             # No chrome.* API, no DOM — this is what the tests exercise.
  storage/   # chrome.storage.local read/write/subscribe, settings schema.
  content/   # the content script: selectors, DOM extraction, rendering,
             # the stale-selector warning, and the MutationObserver loop.
  options/   # React + Tailwind settings page.
  popup/     # a small vanilla-JS popup: master toggle + a link to settings.
  tests/     # vitest unit tests and fixtures.
```

Two Vite build passes, not the CRXJS plugin: CRXJS wraps content scripts
in a dynamic-import loader and adds the resulting chunk to
`web_accessible_resources`, which conflicts directly with this project's
"no WAR, no exposed files" constraint. Instead, `vite.config.ts` builds
the options and popup pages as an ordinary multi-page app, and
`vite.content.config.ts` builds the content script separately in library
mode as a single self-contained IIFE — no chunks, so there's nothing that
would ever need to be web-accessible.

## Selector fragility

LinkedIn's DOM has no stable public contract and its class names rotate.
See [SELECTORS.md](SELECTORS.md) for what's used, why it's expected to
break, and how to re-derive it from a live page. The extension also shows
a dismissible in-page notice if it detects the selectors have gone stale
(DOM is mutating, but zero posts are being extracted from it).
