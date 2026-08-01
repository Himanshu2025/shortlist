import { loadSettings, saveSettings } from "../storage/storage";
import { GET_MATCH_COUNT, type GetMatchCountResponse } from "../messaging";

// Deliberately vanilla — no framework needed for one toggle and a link.
// This is also the only reachable entry point to the options page for
// users who don't dig through chrome://extensions, since we ship no
// background worker to do it another way.

/** Asks a tab's content script how many matches it's found this session.
 * Returns null when nothing answers — either it's not a LinkedIn tab, or
 * (just as likely) it is one but the content script was never injected
 * because the tab predates the extension being installed/enabled/rebuilt.
 * Chrome only auto-injects content scripts into tabs that load *after*
 * that point, so an already-open tab needs a manual reload — there's no
 * permission-free way to force-inject into it from here. */
async function getMatchCount(tabId: number): Promise<number | null> {
  try {
    const response = (await chrome.tabs.sendMessage(tabId, {
      type: GET_MATCH_COUNT,
    })) as GetMatchCountResponse | undefined;
    return response?.count ?? null;
  } catch {
    return null;
  }
}

async function render(): Promise<void> {
  const root = document.getElementById("root");
  if (!root) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const [settings, matchCount] = await Promise.all([
    loadSettings(),
    tab?.id ? getMatchCount(tab.id) : Promise.resolve(null),
  ]);

  root.innerHTML = "";
  root.style.cssText = "padding: 16px; display: flex; flex-direction: column; gap: 12px;";

  const title = document.createElement("div");
  title.textContent = "Shortlist";
  title.style.cssText = "font-weight: 700; font-size: 14px;";
  root.appendChild(title);

  const countRow = document.createElement("div");
  countRow.style.cssText = "font-size: 13px; color: #57534e;";
  countRow.textContent =
    matchCount === null
      ? "Open your LinkedIn feed to see matches."
      : `${matchCount} match${matchCount === 1 ? "" : "es"} found this session.`;
  root.appendChild(countRow);

  // No response from a live tab means the content script isn't running
  // there yet — most commonly right after installing, rebuilding, or
  // re-enabling the extension, since Chrome doesn't retroactively inject
  // into tabs that were already open. A reload is what fixes it; offer it
  // directly instead of leaving the user to guess.
  if (matchCount === null && tab?.id) {
    const reloadRow = document.createElement("div");
    reloadRow.style.cssText =
      "font-size: 12px; color: #78716c; display: flex; flex-direction: column; gap: 6px;";

    const hint = document.createElement("span");
    hint.textContent =
      "Just installed or re-enabled Shortlist? Reload the tab to activate it there.";
    reloadRow.appendChild(hint);

    const reloadButton = document.createElement("button");
    reloadButton.type = "button";
    reloadButton.textContent = "Reload this tab";
    reloadButton.style.cssText = [
      "all: unset",
      "cursor: pointer",
      "text-align: center",
      "font-size: 12px",
      "font-weight: 600",
      "padding: 6px",
      "border-radius: 6px",
      "border: 1px solid #d6d3d1",
      "color: #1c1917",
    ].join(";");
    const tabId = tab.id;
    reloadButton.addEventListener("click", () => {
      void chrome.tabs.reload(tabId);
      window.close();
    });
    reloadRow.appendChild(reloadButton);
    root.appendChild(reloadRow);
  }

  const toggleRow = document.createElement("label");
  toggleRow.style.cssText =
    "display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; cursor: pointer;";

  const toggleLabel = document.createElement("span");
  toggleLabel.textContent = "Enabled on this feed";
  toggleRow.appendChild(toggleLabel);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = settings.enabled;
  checkbox.style.cssText = "width: 16px; height: 16px; accent-color: #f97316;";
  checkbox.addEventListener("change", () => {
    void saveSettings({ ...settings, enabled: checkbox.checked });
  });
  toggleRow.appendChild(checkbox);
  root.appendChild(toggleRow);

  const optionsButton = document.createElement("button");
  optionsButton.type = "button";
  optionsButton.textContent = "Open settings";
  optionsButton.style.cssText = [
    "all: unset",
    "cursor: pointer",
    "text-align: center",
    "font-size: 13px",
    "font-weight: 600",
    "padding: 8px",
    "border-radius: 6px",
    "background: #f97316",
    "color: #1c1917",
  ].join(";");
  optionsButton.addEventListener("click", () => chrome.runtime.openOptionsPage());
  root.appendChild(optionsButton);
}

void render();
