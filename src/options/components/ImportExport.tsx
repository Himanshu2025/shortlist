import { useRef, useState } from "react";
import type { Ruleset } from "../../core/types";
import { parseRulesetJson, serializeRuleset } from "../../core/ruleset-io";
import { Section } from "./ui/Section";
import { Button } from "./ui/Button";

interface ImportExportProps {
  ruleset: Ruleset;
  onImport: (ruleset: Ruleset) => void;
}

export function ImportExport({ ruleset, onImport }: ImportExportProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    const blob = new Blob([serializeRuleset(ruleset)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shortlist-ruleset.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = parseRulesetJson(String(reader.result ?? ""));
      if (result.ok) {
        setError(null);
        onImport(result.ruleset);
      } else {
        setError(result.error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Section
      title="Import / export"
      description="Settings portability only — your skills, aliases, and phrase lists. Never post data."
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleExport}>Export ruleset (.json)</Button>
        <Button onClick={() => fileInput.current?.click()}>Import ruleset…</Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-2 text-xs text-red-700 dark:text-red-400">{error}</p>}
    </Section>
  );
}
