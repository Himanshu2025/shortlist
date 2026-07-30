import type { FeedPost } from "../core/types";
import {
  AUTHOR_NAME_SELECTORS,
  HIDE_POST_ARIA_PREFIXES,
  POST_TEXT_SELECTORS,
  URN_ATTRIBUTE_SELECTORS,
  queryOneChain,
} from "./selectors";

// Trailing "…see more" / "…more" button text, in the order LinkedIn tends
// to render it. The full body is already in textContent — we only need to
// strip the button's own label off the end.
const SEE_MORE_SUFFIXES = [
  /\s*…\s*see\s*more\s*$/i,
  /\s*\.\.\.\s*see\s*more\s*$/i,
  /\s*…\s*more\s*$/i,
  /\s*\.\.\.\s*more\s*$/i,
  /\s*see\s*more\s*$/i,
];

function stripSeeMore(text: string): string {
  let result = text;
  for (const pattern of SEE_MORE_SUFFIXES) {
    const stripped = result.replace(pattern, "");
    if (stripped !== result) {
      result = stripped;
      break;
    }
  }
  return result.trim();
}

/** The post's "Hide post" / "Open control menu" button — present on every
 * real post, and the anchor both the container selector and author-name
 * extraction key off. See selectors.ts for why. */
function findPostAnchorButton(container: Element): HTMLElement | null {
  for (const prefix of HIDE_POST_ARIA_PREFIXES) {
    const button = container.querySelector(`button[aria-label^="${prefix}"]`);
    if (button) return button as HTMLElement;
  }
  return null;
}

/** The header block: the smallest ancestor of the anchor button that also
 * contains the author's profile/company link. Excluded from post-body-text
 * detection below so the author's name/timestamp text never gets picked up
 * as the post body. */
function findHeaderBlock(container: Element, anchorButton: Element): Element | null {
  const nameLink = [...container.querySelectorAll('a[href*="/in/"], a[href*="/company/"]')].find(
    (a) => (a.textContent ?? "").trim().length > 0,
  );
  let el: Element | null = anchorButton;
  while (el && !(nameLink && el.contains(nameLink))) {
    el = el.parentElement;
  }
  return el;
}

/** LinkedIn's `id`/`componentkey` attribute on the post's role="listitem"
 * root — an opaque per-post render key. As of the last re-derivation,
 * LinkedIn no longer exposes a literal `urn:li:activity:...` string in
 * the DOM at all; this is the closest stable substitute, and is what the
 * Map in content/index.ts is actually keyed on. */
export function getUrn(container: Element): string | null {
  const componentKey = container.getAttribute("componentkey");
  if (componentKey) return componentKey;
  for (const attr of ["data-urn", "data-id"]) {
    const value = container.getAttribute(attr);
    if (value?.startsWith("urn:li:activity")) return value;
  }
  const nested = queryOneChain(container, URN_ATTRIBUTE_SELECTORS);
  return nested?.getAttribute("data-urn") ?? nested?.getAttribute("data-id") ?? null;
}

export function extractAuthorName(container: Element): string {
  const anchorButton = findPostAnchorButton(container);
  const label = anchorButton?.getAttribute("aria-label") ?? "";
  for (const prefix of HIDE_POST_ARIA_PREFIXES) {
    if (label.startsWith(prefix)) return label.slice(prefix.length).trim();
  }
  const node = queryOneChain(container, AUTHOR_NAME_SELECTORS);
  return (node?.textContent ?? "").trim();
}

const TEXT_BLOCK_THRESHOLD = 40;

/** LinkedIn renders a screen-reader-only duplicate of some text (e.g. a
 * job-details card's title appears twice back-to-back in textContent).
 * Cheap tell: the string is literally two identical halves. */
function isSelfDuplicate(text: string): boolean {
  const length = text.length;
  if (length === 0 || length % 2 !== 0) return false;
  const half = length / 2;
  return text.slice(0, half) === text.slice(half);
}

/** The post body's wrapping span carries a build-scoped hashed class with
 * no semantic hook, so instead of a selector this finds the largest
 * "self-contained" text block in the post outside the header: an element
 * whose own aggregated text clears the threshold but none of whose direct
 * children individually do (the tightest wrapper around that text run),
 * skipping the screen-reader duplicate pattern.
 *
 * Single bottom-up walk, not `querySelectorAll("*")` + `.textContent` per
 * element — `.textContent` re-walks an element's whole subtree internally,
 * so calling it at every level of a deep post tree is quadratic-ish. This
 * computes each element's aggregated text exactly once, reusing children's
 * already-computed text on the way back up. */
function findPostBodyText(container: Element, header: Element | null): string {
  let bestText = "";
  let bestLength = 0;

  function visit(el: Element): string {
    if (header && (header === el || header.contains(el))) return "";

    let combined = "";
    let hasQualifyingChild = false;
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        combined += node.textContent ?? "";
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const childText = visit(node as Element);
        combined += childText;
        if (childText.trim().length >= TEXT_BLOCK_THRESHOLD) hasQualifyingChild = true;
      }
    }

    if (!hasQualifyingChild) {
      const trimmed = combined.trim();
      if (
        trimmed.length >= TEXT_BLOCK_THRESHOLD &&
        trimmed.length > bestLength &&
        !isSelfDuplicate(trimmed)
      ) {
        bestLength = trimmed.length;
        bestText = trimmed;
      }
    }

    return combined;
  }

  visit(container);
  return bestText ? stripSeeMore(bestText) : "";
}

/** Reads textContent, not visible text — LinkedIn clamps long posts behind
 * "…see more" with CSS, but the full body is already in the DOM. */
export function extractPostText(container: Element): string {
  const anchorButton = findPostAnchorButton(container);
  const header = anchorButton ? findHeaderBlock(container, anchorButton) : null;
  const heuristic = findPostBodyText(container, header);
  if (heuristic) return heuristic;
  const node = queryOneChain(container, POST_TEXT_SELECTORS);
  if (!node) return "";
  return stripSeeMore(node.textContent ?? "");
}

export function buildFeedPost(container: Element): FeedPost | null {
  const urn = getUrn(container);
  if (!urn) return null;
  return {
    urn,
    text: extractPostText(container),
    authorName: extractAuthorName(container),
  };
}
