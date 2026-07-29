// LinkedIn ships no stable public DOM contract — every selector below WILL
// break as they roll class-name changes out. Each is a fallback chain: we
// try entries in order and use the first one that returns anything. See
// SELECTORS.md for how to re-derive these from a live page when they do.

export const POST_CONTAINER_SELECTORS = [
  'div[data-urn^="urn:li:activity"]',
  'div[data-id^="urn:li:activity"]',
  "div.feed-shared-update-v2",
  ".scaffold-finite-scroll__content > div",
];

export const URN_ATTRIBUTE_SELECTORS = [
  '[data-urn^="urn:li:activity"]',
  '[data-id^="urn:li:activity"]',
];

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

export const AUTHOR_HEADLINE_SELECTORS = [
  ".update-components-actor__description",
  ".feed-shared-actor__description",
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
