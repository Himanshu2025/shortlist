// Users type phrases, never regex — a raw-regex field would let a bad
// pattern throw inside the MutationObserver or backtrack catastrophically
// and freeze the tab. Everything here compiles plain text into safe regex.

export function escapeRegex(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Multi-word phrases collapse internal whitespace to `\s+` so line-wrapped
 * DOM text still matches. */
function phraseToPattern(phrase: string): string {
  return phrase
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegex)
    .join("\\s+");
}

/** Word-boundary guarded so "react" misses "reactive"/"reaction", and the
 * `.`/`-` guards stop a bare alias like "node" from also firing on
 * hyphenated compounds such as "some-node-service". */
export function boundedPattern(phrase: string): string {
  return `(?<![\\w.-])${phraseToPattern(phrase)}(?![\\w-])`;
}

/** Matches nothing — the safe compilation target for an empty phrase list.
 * (An empty alternation would otherwise compile to `//`, which matches
 * every string.) */
export const NEVER_MATCH = /(?!)/;
