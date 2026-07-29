import type { Settings } from "../core/types";
import { SETTINGS_KEY, coerceSettings, defaultSettings } from "./schema";

// The only thing shortlist ever writes to disk: settings (skill list,
// alias overrides, locations, toggles). Never post content. `local`, not
// `sync` — alias maps easily exceed sync's 8KB item cap.

export async function loadSettings(): Promise<Settings> {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  const value = stored[SETTINGS_KEY];
  return value === undefined ? defaultSettings() : coerceSettings(value);
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

export function onSettingsChanged(callback: (settings: Settings) => void): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string,
  ) => {
    if (areaName !== "local") return;
    const change = changes[SETTINGS_KEY];
    if (!change) return;
    callback(coerceSettings(change.newValue));
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
