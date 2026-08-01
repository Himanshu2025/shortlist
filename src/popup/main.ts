import { loadSettings, saveSettings } from "../storage/storage";
import { GET_MATCH_COUNT, type GetMatchCountResponse } from "../messaging";

// Deliberately vanilla — no framework needed for one toggle and a link.
// This is also the only reachable entry point to the options page for
// users who don't dig through chrome://extensions, since we ship no
// background worker to do it another way.

/** Asks the active tab's content script how many matches it's found this
 * session. Returns null on any tab without our content script running
 * (not LinkedIn, or not yet injected) — there's nothing to report there,
 * not an error worth surfacing. */
async function getMatchCount(): Promise<number | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return null;
  try {
    const response = (await chrome.tabs.sendMessage(tab.id, {
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

  const [settings, matchCount] = await Promise.all([loadSettings(), getMatchCount()]);

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
