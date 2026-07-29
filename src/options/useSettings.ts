import { useCallback, useEffect, useRef, useState } from "react";
import type { Settings } from "../core/types";
import { loadSettings, saveSettings } from "../storage/storage";

const SAVE_DEBOUNCE_MS = 250;

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    void loadSettings().then(setSettings);
  }, []);

  const update = useCallback((updater: (current: Settings) => Settings) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        void saveSettings(next);
      }, SAVE_DEBOUNCE_MS);
      return next;
    });
  }, []);

  const replace = useCallback((next: Settings) => {
    window.clearTimeout(saveTimer.current);
    setSettings(next);
    void saveSettings(next);
  }, []);

  return { settings, update, replace };
}
