// LinkedIn's markup rotates; when it does, the selector fallback chains in
// selectors.ts stop matching. This surfaces that as a visible, dismissible
// notice instead of silently doing nothing — nothing here touches storage.

const STALE_STREAK_THRESHOLD = 3;

let staleStreak = 0;
let dismissed = false;
let banner: HTMLDivElement | null = null;

function buildBanner(): HTMLDivElement {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.top = "12px";
  host.style.right = "12px";
  host.style.zIndex = "2147483647";

  const shadow = host.attachShadow({ mode: "open" });
  const box = document.createElement("div");
  box.style.cssText = [
    "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    "font-size: 12px",
    "line-height: 1.4",
    "max-width: 280px",
    "padding: 10px 12px",
    "border-radius: 8px",
    "background: #141b2d",
    "color: #e6e9ee",
    "box-shadow: 0 4px 16px rgba(0,0,0,0.25)",
    "display: flex",
    "gap: 8px",
    "align-items: flex-start",
  ].join(";");

  const text = document.createElement("span");
  text.textContent =
    "Shortlist: selectors look stale — LinkedIn's layout may have changed. See SELECTORS.md.";

  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.textContent = "×";
  dismiss.setAttribute("aria-label", "Dismiss");
  dismiss.style.cssText =
    "all: unset; cursor: pointer; color: #d98a0b; font-size: 14px; line-height: 1;";
  dismiss.addEventListener("click", () => {
    dismissed = true;
    hide();
  });

  box.appendChild(text);
  box.appendChild(dismiss);
  shadow.appendChild(box);
  return host;
}

function show(): void {
  if (banner) return;
  banner = buildBanner();
  document.body.appendChild(banner);
}

function hide(): void {
  banner?.remove();
  banner = null;
}

/**
 * Call after each scan pass.
 * @param nodesObserved whether this pass was triggered by DOM mutations
 *   (i.e. the feed is actively rendering content)
 * @param containersFound how many post containers the selector chain found
 * @param extracted how many of those yielded non-empty post text
 */
export function reportScan(
  nodesObserved: boolean,
  containersFound: number,
  extracted: number,
): void {
  const looksStale = nodesObserved && (containersFound === 0 || extracted === 0);
  if (looksStale) {
    staleStreak += 1;
  } else {
    staleStreak = 0;
    hide();
  }
  if (staleStreak >= STALE_STREAK_THRESHOLD && !dismissed) {
    show();
  }
}
