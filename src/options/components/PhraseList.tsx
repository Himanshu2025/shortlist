import { useState } from "react";
import { Chip } from "./ui/Chip";
import { Button } from "./ui/Button";
import { Section } from "./ui/Section";
import { ResetSection } from "./ui/ResetSection";

interface PhraseListProps {
  title: string;
  description: string;
  phrases: string[];
  onChange: (phrases: string[]) => void;
  onReset: () => void;
  placeholder?: string;
}

export function PhraseList({
  title,
  description,
  phrases,
  onChange,
  onReset,
  placeholder = "Add a phrase…",
}: PhraseListProps) {
  const [draft, setDraft] = useState("");

  const addPhrase = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (phrases.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...phrases, trimmed]);
    setDraft("");
  };

  const removePhrase = (index: number) => {
    onChange(phrases.filter((_, i) => i !== index));
  };

  return (
    <Section title={title} description={description} action={<ResetSection onReset={onReset} />}>
      <div className="mb-3 flex flex-wrap gap-2">
        {phrases.length === 0 && (
          <p className="text-xs italic text-ink/40 dark:text-paper/40">No phrases yet.</p>
        )}
        {phrases.map((phrase, i) => (
          <Chip key={`${phrase}-${i}`} label={phrase} onRemove={() => removePhrase(i)} />
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addPhrase();
            }
          }}
          placeholder={placeholder}
          className="w-full max-w-xs rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm text-ink placeholder:text-ink/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent dark:border-paper/20 dark:bg-white/5 dark:text-paper dark:placeholder:text-paper/30"
        />
        <Button onClick={addPhrase}>Add</Button>
      </div>
    </Section>
  );
}
