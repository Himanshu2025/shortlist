import type { Settings } from "../core/types";
import { DEFAULT_RULESET } from "../core/defaults";

export const SETTINGS_KEY = "shortlist.settings";
export const CURRENT_VERSION = 1;

export function defaultSettings(): Settings {
  return {
    version: CURRENT_VERSION,
    enabled: true,
    collapseMisses: true,
    ruleset: DEFAULT_RULESET,
  };
}

/** Best-effort recovery for partially-shaped or pre-v1 stored data, so a
 * corrupted or hand-edited value doesn't brick the extension. */
export function coerceSettings(value: unknown): Settings {
  if (typeof value !== "object" || value === null) return defaultSettings();
  const candidate = value as Partial<Settings>;
  const fallback = defaultSettings();
  return {
    version: CURRENT_VERSION,
    enabled: typeof candidate.enabled === "boolean" ? candidate.enabled : fallback.enabled,
    collapseMisses:
      typeof candidate.collapseMisses === "boolean"
        ? candidate.collapseMisses
        : fallback.collapseMisses,
    ruleset: candidate.ruleset ?? fallback.ruleset,
  };
}
