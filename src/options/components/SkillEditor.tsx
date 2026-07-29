import { useState } from "react";
import type { SkillRule } from "../../core/types";
import { Chip } from "./ui/Chip";
import { Button } from "./ui/Button";
import { Section } from "./ui/Section";
import { ResetSection } from "./ui/ResetSection";

interface SkillEditorProps {
  skills: SkillRule[];
  onChange: (skills: SkillRule[]) => void;
  onReset: () => void;
}

function SkillRow({
  skill,
  onChange,
  onRemove,
}: {
  skill: SkillRule;
  onChange: (skill: SkillRule) => void;
  onRemove: () => void;
}) {
  const [aliasDraft, setAliasDraft] = useState("");

  const addAlias = () => {
    const trimmed = aliasDraft.trim();
    if (!trimmed) return;
    if (skill.aliases.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      setAliasDraft("");
      return;
    }
    onChange({ ...skill, aliases: [...skill.aliases, trimmed] });
    setAliasDraft("");
  };

  const removeAlias = (index: number) => {
    onChange({ ...skill, aliases: skill.aliases.filter((_, i) => i !== index) });
  };

  return (
    <div className="rounded-md border border-ink/10 p-3 dark:border-paper/10">
      <div className="mb-2 flex items-center gap-2">
        <input
          type="text"
          value={skill.name}
          onChange={(e) => onChange({ ...skill, name: e.target.value })}
          className="rounded-md border border-ink/15 bg-white px-2 py-1 font-mono text-sm font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent dark:border-paper/20 dark:bg-white/5 dark:text-paper"
        />
        <Button variant="danger" className="ml-auto" onClick={onRemove}>
          Remove skill
        </Button>
      </div>
      <div className="mb-2 flex flex-wrap gap-2">
        {skill.aliases.map((alias, i) => (
          <Chip key={`${alias}-${i}`} label={alias} onRemove={() => removeAlias(i)} />
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={aliasDraft}
          onChange={(e) => setAliasDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addAlias();
            }
          }}
          placeholder="Add an alias…"
          className="w-full max-w-[220px] rounded-md border border-ink/15 bg-white px-2.5 py-1 text-xs placeholder:text-ink/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent dark:border-paper/20 dark:bg-white/5 dark:text-paper dark:placeholder:text-paper/30"
        />
        <Button variant="ghost" className="text-xs" onClick={addAlias}>
          Add alias
        </Button>
      </div>
    </div>
  );
}

export function SkillEditor({ skills, onChange, onReset }: SkillEditorProps) {
  const addSkill = () => {
    onChange([...skills, { name: "New skill", aliases: [] }]);
  };

  const updateSkill = (index: number, next: SkillRule) => {
    onChange(skills.map((s, i) => (i === index ? next : s)));
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <Section
      title="Skills"
      description="A post matches once it's flagged as hiring AND names at least one of these — by name or by alias."
      action={<ResetSection label="Reset skills to defaults" onReset={onReset} />}
    >
      <div className="mb-3 flex flex-col gap-2">
        {skills.map((skill, i) => (
          <SkillRow
            key={i}
            skill={skill}
            onChange={(next) => updateSkill(i, next)}
            onRemove={() => removeSkill(i)}
          />
        ))}
      </div>
      <Button onClick={addSkill}>Add skill</Button>
    </Section>
  );
}
