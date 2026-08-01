import contentCss from "./content.css?inline";
import type { Verdict } from "../core/types";

// One shared constructable stylesheet, adopted by every shadow root —
// cheaper than parsing the same CSS text per post, and still fully
// isolated: LinkedIn's CSS can't reach in, ours can't leak out.
const sheet = new CSSStyleSheet();
sheet.replaceSync(contentCss);

interface DecorationState {
  host: HTMLDivElement;
  shadow: ShadowRoot;
  expanded: boolean;
}

// Keyed on the post's DOM container so a redecorate (settings changed,
// node recycled to a different post) can find and reset prior state.
const decorations = new WeakMap<Element, DecorationState>();

function resetContainerStyle(container: Element): void {
  const el = container as HTMLElement;
  el.style.removeProperty("max-height");
  el.style.removeProperty("overflow");
}

function ensureHost(container: Element): DecorationState {
  const existing = decorations.get(container);
  if (existing) return existing;
  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });
  shadow.adoptedStyleSheets = [sheet];
  const state: DecorationState = { host, shadow, expanded: false };
  decorations.set(container, state);
  return state;
}

export function clearDecoration(container: Element): void {
  const state = decorations.get(container);
  state?.host.remove();
  resetContainerStyle(container);
  decorations.delete(container);
  delete (container as HTMLElement).dataset["slUrn"];
}

function renderMatchBar(shadow: ShadowRoot, verdict: Verdict): void {
  shadow.innerHTML = "";
  const bar = document.createElement("div");
  bar.className = "sl-bar";

  const row = document.createElement("div");
  row.className = "sl-chip-row";

  for (const skill of verdict.matchedSkills) {
    const chip = document.createElement("span");
    chip.className = "sl-chip sl-chip--skill";
    chip.textContent = skill;
    row.appendChild(chip);
  }

  const facetLabels: string[] = [];
  if (verdict.facets.seniority) facetLabels.push(verdict.facets.seniority);
  if (verdict.facets.workMode) facetLabels.push(verdict.facets.workMode);
  if (verdict.facets.sponsorship) {
    facetLabels.push(
      verdict.facets.sponsorship === "offered" ? "sponsorship offered" : "no sponsorship",
    );
  }
  if (verdict.facets.salary) facetLabels.push(verdict.facets.salary);
  for (const label of facetLabels) {
    const chip = document.createElement("span");
    chip.className = "sl-chip sl-chip--facet";
    chip.textContent = label;
    row.appendChild(chip);
  }

  bar.appendChild(row);

  // Built from three text nodes plus a <mark>, never innerHTML — the post
  // text is untrusted (LinkedIn user content), so this must never be
  // interpreted as markup.
  if (verdict.snippet) {
    const { text, highlightStart, highlightEnd } = verdict.snippet;
    const p = document.createElement("p");
    p.className = "sl-snippet";
    p.appendChild(document.createTextNode(text.slice(0, highlightStart)));
    const mark = document.createElement("mark");
    mark.className = "sl-snippet__mark";
    mark.textContent = text.slice(highlightStart, highlightEnd);
    p.appendChild(mark);
    p.appendChild(document.createTextNode(text.slice(highlightEnd)));
    bar.appendChild(p);
  }

  shadow.appendChild(bar);
}

function renderMissStrip(
  shadow: ShadowRoot,
  authorName: string,
  expanded: boolean,
  onToggle: () => void,
): void {
  shadow.innerHTML = "";
  const strip = document.createElement("div");
  strip.className = "sl-strip";

  const author = document.createElement("span");
  author.className = "sl-strip__author";
  author.textContent = authorName || "Unknown";
  strip.appendChild(author);

  const tag = document.createElement("span");
  tag.className = "sl-strip__tag";
  tag.textContent = "no match";
  strip.appendChild(tag);

  const button = document.createElement("button");
  button.className = "sl-strip__expand";
  button.type = "button";
  button.textContent = expanded ? "collapse" : "expand";
  button.setAttribute("aria-expanded", String(expanded));
  button.addEventListener("click", onToggle);
  strip.appendChild(button);

  shadow.appendChild(strip);
}

export interface DecorateOptions {
  collapseMisses: boolean;
}

/** Never removes or moves LinkedIn's own post nodes — that's what causes
 * scroll jump in a virtualized feed. The badge/strip is inserted as a
 * SIBLING immediately before the post (not a child of it), so it survives
 * LinkedIn's own React reconciling that subtree, and stays visible even
 * when the post itself is collapsed via max-height. */
export function decoratePost(
  container: Element,
  urn: string,
  verdict: Verdict,
  authorName: string,
  options: DecorateOptions,
): void {
  const parent = container.parentElement;
  if (!parent) return;

  const el = container as HTMLElement;
  el.dataset["slUrn"] = urn;

  const state = ensureHost(container);
  if (!state.host.isConnected) {
    parent.insertBefore(state.host, container);
  }

  if (verdict.isMatch) {
    resetContainerStyle(container);
    renderMatchBar(state.shadow, verdict);
    return;
  }

  if (!options.collapseMisses) {
    resetContainerStyle(container);
    state.shadow.innerHTML = "";
    return;
  }

  const applyCollapse = (expanded: boolean): void => {
    state.expanded = expanded;
    if (expanded) {
      resetContainerStyle(container);
    } else {
      el.style.maxHeight = "0px";
      el.style.overflow = "hidden";
    }
    renderMissStrip(state.shadow, authorName, expanded, () => applyCollapse(!state.expanded));
  };

  applyCollapse(state.expanded);
}
