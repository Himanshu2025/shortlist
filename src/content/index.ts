import type { Settings, Verdict } from "../core/types";
import { getCompiledRuleset } from "../core/compile";
import { evaluatePost } from "../core/match";
import { loadSettings, onSettingsChanged } from "../storage/storage";
import { POST_CONTAINER_SELECTORS, queryAllChain } from "./selectors";
import { buildFeedPost } from "./extract";
import { decoratePost, clearDecoration } from "./render";
import { reportScan } from "./staleness";

// Keyed on the post's render identity (FeedPost.urn — see extract.ts),
// not DOM node — the feed is virtualized and recycles nodes, so without
// this we'd re-run matching every time a post scrolls back into view.
// This Map lives only in memory: it dies on reload, and that's what keeps
// "stores nothing" literally true.
const verdicts = new Map<string, Verdict>();

let settings: Settings | null = null;
let scanScheduled = false;

function scan(nodesObserved: boolean): void {
  if (!settings) return;
  const containers = queryAllChain(document, POST_CONTAINER_SELECTORS);
  const compiled = getCompiledRuleset(settings.ruleset);
  let extracted = 0;

  for (const container of containers) {
    const post = buildFeedPost(container);
    if (!post) continue;
    if (post.text) extracted += 1;

    if (!settings.enabled) {
      clearDecoration(container);
      continue;
    }

    const el = container as HTMLElement;
    const alreadyCorrect = el.dataset["slUrn"] === post.urn && verdicts.has(post.urn);
    if (alreadyCorrect) continue;

    let verdict = verdicts.get(post.urn);
    if (!verdict) {
      verdict = evaluatePost(post, compiled);
      verdicts.set(post.urn, verdict);
    }

    decoratePost(container, post.urn, verdict, post.authorName, {
      collapseMisses: settings.collapseMisses,
    });
  }

  reportScan(nodesObserved, containers.length, extracted);
}

function scheduleScan(): void {
  if (scanScheduled) return;
  scanScheduled = true;
  requestAnimationFrame(() => {
    scanScheduled = false;
    scan(true);
  });
}

async function init(): Promise<void> {
  settings = await loadSettings();

  onSettingsChanged((next) => {
    settings = next;
    // Ruleset (or toggles) changed — clear the cache and re-decorate
    // everything currently rendered so the feed updates live.
    verdicts.clear();
    scan(false);
  });

  scan(true);

  const observer = new MutationObserver((mutations) => {
    const sawAddedNodes = mutations.some((m) => m.addedNodes.length > 0);
    if (sawAddedNodes) scheduleScan();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

void init();
