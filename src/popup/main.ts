import { loadSettings, saveSettings } from "../storage/storage";

// Deliberately vanilla — no framework needed for one toggle and a link.
// This is also the only reachable entry point to the options page for
// users who don't dig through chrome://extensions, since we ship no
// background worker to do it another way.

async function render(): Promise<void> {
  const root = document.getElementById("root");
  if (!root) return;

  const settings = await loadSettings();

  root.innerHTML = "";
  root.style.cssText = "padding: 16px; display: flex; flex-direction: column; gap: 12px;";

  const title = document.createElement("div");
  title.textContent = "Shortlist";
  title.style.cssText = "font-weight: 700; font-size: 14px;";
  root.appendChild(title);

  const toggleRow = document.createElement("label");
  toggleRow.style.cssText =
    "display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; cursor: pointer;";

  const toggleLabel = document.createElement("span");
  toggleLabel.textContent = "Enabled on this feed";
  toggleRow.appendChild(toggleLabel);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = settings.enabled;
  checkbox.style.cssText = "width: 16px; height: 16px; accent-color: #d98a0b;";
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
    "background: #d98a0b",
    "color: #141b2d",
  ].join(";");
  optionsButton.addEventListener("click", () => chrome.runtime.openOptionsPage());
  root.appendChild(optionsButton);
}

void render();
