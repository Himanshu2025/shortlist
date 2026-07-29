import type { FeedPost } from "../core/types";
import {
  AUTHOR_HEADLINE_SELECTORS,
  AUTHOR_NAME_SELECTORS,
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

export function getUrn(container: Element): string | null {
  for (const attr of ["data-urn", "data-id"]) {
    const value = container.getAttribute(attr);
    if (value?.startsWith("urn:li:activity")) return value;
  }
  const nested = queryOneChain(container, URN_ATTRIBUTE_SELECTORS);
  return nested?.getAttribute("data-urn") ?? nested?.getAttribute("data-id") ?? null;
}

/** Reads textContent, not visible text — LinkedIn clamps long posts behind
 * "…see more" with CSS, but the full body is already in the DOM. */
export function extractPostText(container: Element): string {
  const node = queryOneChain(container, POST_TEXT_SELECTORS);
  if (!node) return "";
  return stripSeeMore(node.textContent ?? "");
}

export function extractAuthorName(container: Element): string {
  const node = queryOneChain(container, AUTHOR_NAME_SELECTORS);
  return (node?.textContent ?? "").trim();
}

export function extractAuthorHeadline(container: Element): string {
  const node = queryOneChain(container, AUTHOR_HEADLINE_SELECTORS);
  return (node?.textContent ?? "").trim();
}

export function buildFeedPost(container: Element): FeedPost | null {
  const urn = getUrn(container);
  if (!urn) return null;
  return {
    urn,
    text: extractPostText(container),
    authorName: extractAuthorName(container),
    authorHeadline: extractAuthorHeadline(container),
  };
}
