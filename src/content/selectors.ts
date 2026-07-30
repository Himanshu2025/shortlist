// LinkedIn ships no stable public DOM contract — every selector below WILL
// break as they roll class-name changes out. Each is a fallback chain: we
// try entries in order and use the first one that returns anything. See
// SELECTORS.md for how to re-derive these from a live page when they do.
//
// As of the last re-derivation, LinkedIn's feed classes are build-scoped
// hashes (CSS-Modules-style, e.g. "_612e1a1c") with no semantic meaning —
// there is nothing stable left to select by class name. The durable
// anchors turned out to be accessibility attributes instead: every real
// post has a "Hide post" / "Open control menu" button whose aria-label
// names the author, and that's both the most reliable way to find a post
// container and the cleanest way to read the author's name. The old
// class/data-urn-based chains are kept below as trailing fallbacks in
// case a rollout segment still uses them, but they are not expected to
// match anymore.

/** aria-label prefixes LinkedIn uses on a post's overflow-menu buttons,
 * e.g. "Hide post by Jane Doe" / "Open control menu for post by Jane Doe".
 * Both finding the post container and reading the author's name key off
 * these — see findPostAnchorButton() and extractAuthorName() in extract.ts. */
export const HIDE_POST_ARIA_PREFIXES = ["Hide post by ", "Open control menu for post by "];

export const POST_CONTAINER_SELECTORS = [
  `[role="listitem"]:has(${HIDE_POST_ARIA_PREFIXES.map((p) => `button[aria-label^="${p}"]`).join(", ")})`,
  // Legacy fallbacks — unlikely to match current LinkedIn markup, kept in
  // case a rollout segment still exposes semantic classes/data-urn.
  'div[data-urn^="urn:li:activity"]',
  'div[data-id^="urn:li:activity"]',
  "div.feed-shared-update-v2",
  ".scaffold-finite-scroll__content > div",
];

export const URN_ATTRIBUTE_SELECTORS = [
  '[data-urn^="urn:li:activity"]',
  '[data-id^="urn:li:activity"]',
];

// Legacy selector chains — superseded by the heuristics in extract.ts
// (header-block text classification, largest-self-contained-text-block
// detection) but kept as a trailing fallback.
export const POST_TEXT_SELECTORS = [
  ".feed-shared-update-v2__description .update-components-text",
  ".feed-shared-inline-show-more-text .update-components-text",
  ".update-components-text",
  ".feed-shared-text",
];

export const AUTHOR_NAME_SELECTORS = [
  ".update-components-actor__title .visually-hidden",
  ".update-components-actor__title",
  ".feed-shared-actor__name",
];

function tryQuerySelectorAll(root: ParentNode, selector: string): Element[] {
  try {
    return Array.from(root.querySelectorAll(selector));
  } catch {
    return [];
  }
}

function tryQuerySelector(root: ParentNode, selector: string): Element | null {
  try {
    return root.querySelector(selector);
  } catch {
    return null;
  }
}

/** Returns results from the first selector in the chain that finds anything. */
export function queryAllChain(root: ParentNode, chain: string[]): Element[] {
  for (const selector of chain) {
    const found = tryQuerySelectorAll(root, selector);
    if (found.length > 0) return found;
  }
  return [];
}

/** Returns the first match from the first selector in the chain that finds anything. */
export function queryOneChain(root: ParentNode, chain: string[]): Element | null {
  for (const selector of chain) {
    const found = tryQuerySelector(root, selector);
    if (found) return found;
  }
  return null;
}
