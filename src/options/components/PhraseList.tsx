import { useState } from "react";
import { Plus } from "lucide-react";
import { Chip } from "./ui/Chip";
import { Section } from "./ui/Section";
import { ResetSection } from "./ui/ResetSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
          <p className="text-xs italic text-ink/40">No phrases yet.</p>
        )}
        {phrases.map((phrase, i) => (
          <Chip key={`${phrase}-${i}`} label={phrase} onRemove={() => removePhrase(i)} />
        ))}
      </div>
      <div className="flex gap-2">
        <Input
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
          className="max-w-xs"
        />
        <Button variant="ghost" onClick={addPhrase}>
          <Plus />
          Add
        </Button>
      </div>
    </Section>
  );
}
