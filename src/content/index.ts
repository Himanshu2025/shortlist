import type { Settings, Verdict } from "../core/types";
import { getCompiledRuleset } from "../core/compile";
import { evaluatePost } from "../core/match";
import { loadSettings, onSettingsChanged } from "../storage/storage";
import { POST_CONTAINER_SELECTORS, queryAllChain } from "./selectors";
import { buildFeedPost, getUrn } from "./extract";
import { decoratePost, clearDecoration } from "./render";
import { reportScan } from "./staleness";
import { GET_MATCH_COUNT, type GetMatchCountResponse } from "../messaging";

// Keyed on the post's render identity (FeedPost.urn — see extract.ts),
// not DOM node — the feed is virtualized and recycles nodes, so without
// this we'd re-run matching every time a post scrolls back into view.
// This Map lives only in memory: it dies on reload, and that's what keeps
// "stores nothing" literally true.
const verdicts = new Map<string, Verdict>();

// Distinct matching posts seen this tab session — incremented as new
// verdicts are computed, never decremented (posts don't leave `verdicts`
// once scrolled past). Reported to the popup on request; never persisted.
let matchCount = 0;

let settings: Settings | null = null;
let scanScheduled = false;
let lastScanAt = 0;
const MIN_SCAN_INTERVAL_MS = 200;

function scan(nodesObserved: boolean): void {
  if (!settings) return;
  const containers = queryAllChain(document, POST_CONTAINER_SELECTORS);
  const compiled = getCompiledRuleset(settings.ruleset);
  let extracted = 0;

  for (const container of containers) {
    // Cheap attribute read first — only pay for full DOM-text extraction
    // (buildFeedPost) when the container isn't already correctly
    // decorated for this exact post. Without this, every scan re-walks
    // every post's full text on every mutation, even ones we've already
    // processed.
    const urn = getUrn(container);
    if (!urn) continue;

    if (!settings.enabled) {
      clearDecoration(container);
      continue;
    }

    const el = container as HTMLElement;
    if (el.dataset["slUrn"] === urn && verdicts.has(urn)) {
      extracted += 1;
      continue;
    }

    const post = buildFeedPost(container);
    if (!post) continue;
    if (post.text) extracted += 1;

    let verdict = verdicts.get(post.urn);
    if (!verdict) {
      verdict = evaluatePost(post, compiled);
      verdicts.set(post.urn, verdict);
      if (verdict.isMatch) matchCount += 1;
    }

    decoratePost(container, post.urn, verdict, post.authorName, {
      collapseMisses: settings.collapseMisses,
    });
  }

  reportScan(nodesObserved, containers.length, extracted);
  narrowObserverScope(containers);
}

let observer: MutationObserver | null = null;
let observedRoot: Node = document.body;

/** The observer starts on document.body so it doesn't miss the feed
 * before it's mounted. Once real posts are found, narrow it to their
 * nearest role="list" ancestor — the scrollable list every virtualized
 * item mounts/unmounts inside — so unrelated churn elsewhere on the page
 * (nav bar, chat widget, notification badges) stops triggering a rescan.
 * Stays on document.body if no such ancestor turns up. */
function narrowObserverScope(containers: Element[]): void {
  if (observedRoot !== document.body || containers.length === 0 || !observer) return;
  const list = containers[0]?.closest('[role="list"]');
  if (!list || list === observedRoot) return;

  observer.disconnect();
  observedRoot = list;
  observer.observe(observedRoot, { childList: true, subtree: true });
}

function scheduleScan(): void {
  if (scanScheduled) return;
  scanScheduled = true;
  const delay = Math.max(0, MIN_SCAN_INTERVAL_MS - (performance.now() - lastScanAt));
  window.setTimeout(() => {
    scanScheduled = false;
    lastScanAt = performance.now();
    scan(true);
  }, delay);
}

async function init(): Promise<void> {
  settings = await loadSettings();

  onSettingsChanged((next) => {
    settings = next;
    // Ruleset (or toggles) changed — clear the cache and re-decorate
    // everything currently rendered so the feed updates live. The count
    // resets too: it's a reflection of the current ruleset, not a
    // cross-ruleset lifetime total.
    verdicts.clear();
    matchCount = 0;
    scan(false);
  });

  scan(true);
  lastScanAt = performance.now();

  observer = new MutationObserver((mutations) => {
    const sawAddedNodes = mutations.some((m) => m.addedNodes.length > 0);
    if (sawAddedNodes) scheduleScan();
  });
  observer.observe(observedRoot, { childList: true, subtree: true });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== GET_MATCH_COUNT) return;
    const response: GetMatchCountResponse = { count: matchCount };
    sendResponse(response);
  });
}

void init();
